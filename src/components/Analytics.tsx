import { useState, useEffect } from 'react';
import { getAnalytics } from '../utils/analytics';
import type { AnalyticsData } from '../utils/analytics';
import type { TimeLog } from '../utils/storage';
import { CATEGORY_COLORS } from '../utils/constants';

interface AnalyticsProps {
  uid: string;
  onClose: () => void;
}

export default function Analytics({ uid, onClose }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all' | 'custom'>('7');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      if (timeRange === 'custom') {
        if (!customStart || !customEnd) return;
        setLoading(true);
        const analytics = await getAnalytics(uid, undefined, { start: customStart, end: customEnd });
        setData(analytics);
        setLoading(false);
      } else {
        setLoading(true);
        const analytics = await getAnalytics(uid, timeRange === 'all' ? undefined : parseInt(timeRange));
        setData(analytics);
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [uid, timeRange, customStart, customEnd]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.totalEntries === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Analytics</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-8 text-center text-gray-400">
            No data yet. Start logging time to see insights!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">Analytics</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: 'all', label: 'All time' },
              { value: 'custom', label: 'Custom' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as '7' | '30' | 'all' | 'custom')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Custom date range picker */}
          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 mt-3">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Category breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Time by Category
            </h3>
            <div className="space-y-3">
              {data.categoryBreakdown.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.category as TimeLog['category']]}`} />
                      <span className="font-medium text-gray-700 capitalize">{cat.category}</span>
                      <span className="text-xs text-gray-400">({cat.count} entries)</span>
                    </div>
                    <span className="font-semibold text-gray-800">{cat.totalHours}h</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${CATEGORY_COLORS[cat.category as TimeLog['category']]}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-0.5">{cat.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category + Sub-category bar graph, grouped by category */}
          {data.categorySubBreakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Time by Category & Sub-category
              </h3>
              <div className="space-y-4">
                {data.categoryBreakdown.map((cat) => {
                  const subs = data.categorySubBreakdown.filter((s) => s.category === cat.category);
                  if (subs.length === 0) return null;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.category as TimeLog['category']]}`} />
                        <span className="text-sm font-semibold text-gray-700 capitalize">{cat.category}</span>
                        <span className="text-xs text-gray-400">— {cat.totalHours}h ({cat.percentage}%)</span>
                      </div>
                      <div className="space-y-1.5 pl-5">
                        {subs.map((item) => (
                          <div key={item.subCategory}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm text-gray-600 truncate">{item.subCategory}</span>
                              <span className="text-xs font-medium text-gray-500 shrink-0 ml-2">
                                {item.totalHours}h ({item.percentage}%)
                              </span>
                            </div>
                            <div className="h-4 bg-gray-100 rounded overflow-hidden">
                              <div
                                className={`h-full ${CATEGORY_COLORS[item.category as TimeLog['category']]} opacity-75`}
                                style={{ width: `${item.percentage}%`, minWidth: item.percentage > 0 ? '4px' : '0' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
