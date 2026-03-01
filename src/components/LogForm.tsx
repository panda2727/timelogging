import { useState, useRef } from 'react';
import type { TimeLog } from '../utils/storage';
import { CATEGORY_COLORS } from '../utils/constants';
import { parseVoiceEntry } from '../utils/voiceParsing';

const CATEGORIES: TimeLog['category'][] = ['self', 'routine', 'faith', 'work', 'family'];

interface LogFormProps {
  onSubmit: (log: Omit<TimeLog, 'id' | 'date'>) => void;
  onUpdate?: (log: Omit<TimeLog, 'id' | 'date'>) => void;
  onCancelEdit?: () => void;
  editingLog?: TimeLog | null;
}

type VoiceState = 'idle' | 'listening' | 'error';

interface SR {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: Array<{ isFinal: boolean } & { 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SRWindow = Window & { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };

const SpeechRecognitionCtor = (
  (window as SRWindow).SpeechRecognition ??
  (window as SRWindow).webkitSpeechRecognition ??
  null
);
const speechSupported = SpeechRecognitionCtor !== null;

const IconMic = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
    <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
  </svg>
);

const IconStop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

export default function LogForm({ onSubmit, onUpdate, onCancelEdit, editingLog }: LogFormProps) {
  const [startTime, setStartTime] = useState(editingLog?.startTime ?? '');
  const [endTime, setEndTime] = useState(editingLog?.endTime ?? '');
  const [category, setCategory] = useState<TimeLog['category'] | ''>(editingLog?.category ?? '');
  const [subCategory, setSubCategory] = useState(editingLog?.subCategory ?? '');
  const [description, setDescription] = useState(editingLog?.description ?? '');

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<SR | null>(null);

  function handleVoice() {
    if (!SpeechRecognitionCtor) return;

    if (voiceState === 'listening') {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setVoiceState('idle');
      setVoiceTranscript('');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setVoiceTranscript(final || interim);
      if (final) {
        const parsed = parseVoiceEntry(final);
        if (parsed.startTime) setStartTime(parsed.startTime);
        if (parsed.endTime) setEndTime(parsed.endTime);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.subCategory !== undefined) setSubCategory(parsed.subCategory);
        if (parsed.description !== undefined) setDescription(parsed.description);
      }
    };

    recognition.onerror = () => {
      setVoiceState('error');
      recognitionRef.current = null;
      setTimeout(() => setVoiceState('idle'), 2000);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setVoiceState('idle');
      setVoiceTranscript('');
    };

    setVoiceTranscript('');
    setVoiceState('listening');
    recognition.start();
  }

  function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    if (!startTime || !endTime || !category) return;

    const data = { startTime, endTime, category, subCategory: subCategory.trimEnd(), description: description.trimEnd() };

    if (editingLog && onUpdate) {
      onUpdate(data);
    } else {
      onSubmit(data);
      setStartTime(endTime);
      setEndTime('');
      setCategory('');
      setSubCategory('');
      setDescription('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {editingLog && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-amber-700">Editing entry</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-amber-600 hover:text-amber-800 underline"
          >
            Cancel
          </button>
        </div>
      )}

      {speechSupported && (
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleVoice}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
              voiceState === 'listening'
                ? 'bg-red-100 text-red-700 border-2 border-red-400 animate-pulse'
                : voiceState === 'error'
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {voiceState === 'listening' ? <IconStop /> : <IconMic />}
            <span className="text-sm">
              {voiceState === 'listening'
                ? voiceTranscript ? `"${voiceTranscript}"` : 'Listening…'
                : voiceState === 'error'
                  ? 'Could not hear — try again'
                  : 'Speak your entry'}
            </span>
          </button>
          {voiceState === 'idle' && (
            <p className="text-xs text-gray-400 text-center">
              e.g. "from 7 am to 9 am category self sub-category workout description running"
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Start</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">End</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                category === cat
                  ? `${CATEGORY_COLORS[cat]} text-white shadow-md scale-105`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Sub-category</label>
        <input
          type="text"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          onBlur={(e) => setSubCategory(e.target.value.trimEnd())}
          placeholder="e.g. exercise, meeting, prayer..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={(e) => setDescription(e.target.value.trimEnd())}
          placeholder="What did you do?"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={!startTime || !endTime || !category}
        className={`w-full text-white py-3 rounded-lg font-medium text-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${
          editingLog
            ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700'
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
        }`}
      >
        {editingLog ? 'Update Entry' : 'Log Time'}
      </button>
    </form>
  );
}
