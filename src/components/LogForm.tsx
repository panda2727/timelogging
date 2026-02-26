import { useState, useEffect } from 'react';
import type { TimeLog } from '../utils/storage';
import { CATEGORY_COLORS } from '../utils/constants';

const CATEGORIES: TimeLog['category'][] = ['self', 'routine', 'faith', 'work', 'family'];

interface LogFormProps {
  onSubmit: (log: Omit<TimeLog, 'id' | 'date'>) => void;
  onUpdate?: (log: Omit<TimeLog, 'id' | 'date'>) => void;
  onCancelEdit?: () => void;
  editingLog?: TimeLog | null;
}

export default function LogForm({ onSubmit, onUpdate, onCancelEdit, editingLog }: LogFormProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<TimeLog['category'] | ''>('');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (editingLog) {
      setStartTime(editingLog.startTime);
      setEndTime(editingLog.endTime);
      setCategory(editingLog.category);
      setSubCategory(editingLog.subCategory);
      setDescription(editingLog.description);
    } else {
      setStartTime('');
      setEndTime('');
      setCategory('');
      setSubCategory('');
      setDescription('');
    }
  }, [editingLog]);

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

      {/* Time inputs */}
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

      {/* Category chips */}
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

      {/* Sub-category */}
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

      {/* Description */}
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

      {/* Submit */}
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
