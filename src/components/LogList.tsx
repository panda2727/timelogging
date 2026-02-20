import type { TimeLog } from '../utils/storage';

const CATEGORY_COLORS: Record<TimeLog['category'], string> = {
  self: 'bg-purple-100 text-purple-700',
  routine: 'bg-green-100 text-green-700',
  faith: 'bg-amber-100 text-amber-700',
  work: 'bg-blue-100 text-blue-700',
  family: 'bg-rose-100 text-rose-700',
};

interface LogListProps {
  logs: TimeLog[];
  editingId?: string | null;
  onEdit: (log: TimeLog) => void;
  onDelete: (id: string) => void;
}

export default function LogList({ logs, editingId, onEdit, onDelete }: LogListProps) {
  if (logs.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8">No entries yet. Start logging!</p>
    );
  }

  const sorted = [...logs].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-2">
      {sorted.map((log) => (
        <div
          key={log.id}
          className={`flex items-center gap-3 bg-white rounded-lg border p-3 shadow-sm transition-colors ${
            editingId === log.id ? 'border-amber-300 bg-amber-50' : 'border-gray-100'
          }`}
        >
          {/* Time */}
          <div className="text-sm text-gray-500 font-mono shrink-0">
            {log.startTime}–{log.endTime}
          </div>

          {/* Category badge */}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${CATEGORY_COLORS[log.category]}`}
          >
            {log.category}
          </span>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {log.subCategory && (
              <span className="text-sm font-medium text-gray-700">{log.subCategory}</span>
            )}
            {log.description && (
              <span className="text-sm text-gray-400 ml-1">— {log.description}</span>
            )}
          </div>

          {/* Edit */}
          <button
            onClick={() => onEdit(log)}
            className="text-gray-300 hover:text-amber-500 transition-colors shrink-0 p-1"
            aria-label="Edit entry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(log.id)}
            className="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-1"
            aria-label="Delete entry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
