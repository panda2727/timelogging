import { useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import LogForm from './components/LogForm';
import LogList from './components/LogList';
import Analytics from './components/Analytics';
import {
  addLogToFirebase,
  updateLogInFirebase,
  deleteLogFromFirebase,
  clearAllLogs,
  subscribeToLogsByDate,
  getTodayString,
} from './utils/firebaseStorage';
import type { TimeLog } from './utils/storage';

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Show loading while auth state is being determined
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return <Login />;

  return <MainApp user={user} />;
}

function MainApp({ user }: { user: User }) {
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);

  const isToday = selectedDate === today;
  const loading = loadedFor !== `${user.uid}:${selectedDate}`;

  useEffect(() => {
    const key = `${user.uid}:${selectedDate}`;
    const unsubscribe = subscribeToLogsByDate(user.uid, selectedDate, (updatedLogs) => {
      setLogs(updatedLogs);
      setLoadedFor(key);
    });
    return () => unsubscribe();
  }, [user.uid, selectedDate]);

  const handleAdd = useCallback(
    async (entry: Omit<TimeLog, 'id' | 'date'>) => {
      try {
        await addLogToFirebase(user.uid, { ...entry, date: selectedDate });
      } catch (error) {
        console.error('Error adding log:', error);
        alert('Failed to add log. Check Firebase configuration.');
      }
    },
    [user.uid, selectedDate],
  );

  const handleUpdate = useCallback(
    async (entry: Omit<TimeLog, 'id' | 'date'>) => {
      if (!editingLog) return;
      try {
        await updateLogInFirebase(user.uid, editingLog.id, { ...entry, date: editingLog.date });
        setEditingLog(null);
      } catch (error) {
        console.error('Error updating log:', error);
        alert('Failed to update log.');
      }
    },
    [user.uid, editingLog],
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteLogFromFirebase(user.uid, id);
      if (editingLog?.id === id) setEditingLog(null);
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log.');
    }
  }, [user.uid, editingLog]);

  const handleClearAll = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL your data from ALL dates? This cannot be undone!'
    );
    if (!confirmed) return;
    const doubleConfirm = window.confirm('This will permanently delete everything. Are you absolutely sure?');
    if (!doubleConfirm) return;
    try {
      await clearAllLogs(user.uid);
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('Failed to clear data.');
    }
  }, [user.uid]);

  const totalMinutes = logs.reduce((sum, log) => {
    const [sh, sm] = log.startTime.split(':').map(Number);
    const [eh, em] = log.endTime.split(':').map(Number);
    return sum + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Time Logger</h1>
              <p className="text-sm text-gray-400">{displayDate}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-500">{hours}h {mins}m</p>
              <p className="text-xs text-gray-400">logged {isToday ? 'today' : 'this day'}</p>
            </div>
          </div>

          {/* Date picker */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                const d = new Date(selectedDate + 'T00:00:00');
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              &lt;
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
            <button
              onClick={() => {
                const d = new Date(selectedDate + 'T00:00:00');
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().slice(0, 10));
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              &gt;
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(today)}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Today
              </button>
            )}
          </div>

          {/* User info + sync */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-1.5 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Synced across all devices</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span>{user.displayName ?? user.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="text-gray-400 hover:text-red-500 transition-colors underline"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Analytics button */}
          <button
            onClick={() => setShowAnalytics(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            View Analytics & Insights
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <LogForm
            key={editingLog?.id ?? 'new'}
            onSubmit={handleAdd}
            onUpdate={handleUpdate}
            editingLog={editingLog}
            onCancelEdit={() => setEditingLog(null)}
          />
        </div>

        {/* Log list */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            {isToday ? "Today's" : displayDate.split(',')[0] + "'s"} Entries ({logs.length})
          </h2>
          <LogList logs={logs} editingId={editingLog?.id} onEdit={setEditingLog} onDelete={handleDelete} />
        </div>

        {/* Clear all data */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleClearAll}
            className="w-full py-2.5 border-2 border-red-300 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-400 transition-colors"
          >
            Clear All Data
          </button>
          <p className="text-xs text-gray-400 text-center mt-1">
            Permanently deletes all your entries from all dates
          </p>
        </div>
      </div>

      {/* Analytics modal */}
      {showAnalytics && <Analytics uid={user.uid} onClose={() => setShowAnalytics(false)} />}
    </div>
  );
}
