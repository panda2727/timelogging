export interface TimeLog {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  category: 'self' | 'routine' | 'faith' | 'work' | 'family';
  subCategory: string;
  description: string;
}

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
