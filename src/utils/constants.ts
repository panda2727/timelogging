import type { TimeLog } from './storage';

export const CATEGORY_COLORS: Record<TimeLog['category'], string> = {
  self: 'bg-purple-500',
  routine: 'bg-green-500',
  faith: 'bg-amber-500',
  work: 'bg-blue-500',
  family: 'bg-rose-500',
};
