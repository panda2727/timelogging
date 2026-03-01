import type { TimeLog } from './storage';

type ParsedEntry = Partial<Omit<TimeLog, 'id' | 'date'>>;

const WORD_TO_NUM: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20,
};

const CATEGORIES = ['self', 'routine', 'faith', 'work', 'family'] as const;

function normalizeTime(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');

  if (s === 'noon') return '12:00';
  if (s === 'midnight') return '00:00';

  let hour: number;
  let minute = 0;

  const wordHour = WORD_TO_NUM[s.split(' ')[0]];
  if (wordHour !== undefined) {
    hour = wordHour;
    if (s.includes('pm') && hour < 12) hour += 12;
    if (s.includes('am') && hour === 12) hour = 0;
  } else {
    const match = s.match(/^(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?$/);
    if (!match) return null;
    hour = parseInt(match[1], 10);
    minute = match[2] ? parseInt(match[2], 10) : 0;
    const period = match[3];
    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Parse a voice transcript by keyword landmarks: "from", "to", "category", "sub-category", "description".
 * Text between adjacent keywords becomes the field value. All fields are optional.
 */
export function parseVoiceEntry(transcript: string): ParsedEntry {
  const result: ParsedEntry = {};

  const text = transcript
    .replace(/\bcolon\b/gi, '')
    .replace(/\bsub\s?-?\s?category\b/gi, 'sub-category')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = text.split(/\b(from|to|category|sub-category|description)\b/i);

  const segments: Record<string, string> = {};
  for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i].toLowerCase();
    const value = (parts[i + 1] ?? '').replace(/^[\s,:]+|[\s,:]+$/g, '');
    if (value) segments[key] = value;
  }

  if (segments['from']) {
    const start = normalizeTime(segments['from']);
    if (start) result.startTime = start;
  }

  if (segments['to']) {
    const end = normalizeTime(segments['to']);
    if (end) result.endTime = end;
  }

  if (segments['category']) {
    const cat = segments['category'].toLowerCase() as TimeLog['category'];
    if (CATEGORIES.includes(cat)) result.category = cat;
  }

  if (segments['sub-category']) {
    result.subCategory = capitalize(segments['sub-category']);
  }

  if (segments['description']) {
    result.description = capitalize(segments['description']);
  }

  return result;
}
