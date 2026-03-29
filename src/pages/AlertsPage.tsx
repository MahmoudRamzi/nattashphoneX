import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Moon, Sun, LogOut, RefreshCw, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import type { AuthUser } from '@/hooks/useAuth';

const API_BASE = 'https://app.qafah.com';

type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
  | 'admin-employees' | 'companies-accumulation' | 'premarket'
  | 'ticker-resell-signals' | 'loads-detail' | 'crossing-report' | 'etfs-report';

interface AlertItem {
  ticker: string;
  alert_time: string;
  cp: number;
  frame: string;
  filter: string;
  target: string | null;
  tp1: number | null;
  tp2: number | null;
  g_5d: boolean;
  g_10d: boolean;
  l_5d: boolean;
  l_10d: boolean;
}

interface AlertsPageProps {
  navigate: (page: Page) => void;
  onLogout?: () => void;
  user?: AuthUser | null;
}

function formatAlertTime(isoStr: string, showSeconds = false) {
  try {
    const safe = isoStr.endsWith('Z') || isoStr.includes('+') ? isoStr : isoStr + 'Z';
    const d = new Date(safe);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');
    const secs = String(d.getUTCSeconds()).padStart(2, '0');
    return showSeconds
      ? `${year}-${month}-${day} ${hours}:${mins}:${secs}`
      : `${year}-${month}-${day} ${hours}:${mins}`;
  } catch { return isoStr; }
}

function getToken() {
  return localStorage.getItem('access_token') || localStorage.getItem('token') || '';
}

const CompanyLogo = ({ ticker }: { ticker: string }) => {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-white shrink-0">
      {ticker.charAt(0)}
    </div>
  );
  return (
    <img
      src={`${API_BASE}/static/logos_tickers/${ticker}.png`}
      alt={ticker}
      className="w-7 h-7 rounded-lg object-cover shrink-0"
      onError={() => setErr(true)}
    />
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <td key={i} className="py-3 px-4">
        <div className="h-4 bg-slate-100 dark:bg-slate-700/60 rounded" />
      </td>
    ))}
  </tr>
);

const KNOWN_FRAMES = ['1', '5', '15', '30', '60', '240', 'D'];
const KNOWN_FILTERS = [
  'All',
  'منطقة دعم رئيسية',
  'منطقة مقاومة رئيسية',
  'تقاطع صاعد',
  'تقاطع هابط',
];
const QUICK_TICKERS = ['QQQ', 'SPY', 'US100', 'US500'];

// ═════════════════════════════════════════════════════════════════════════════
export function AlertsPage({ navigate, onLogout, user }: AlertsPageProps) {
  const [isDark, setIsDark] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  // filters
  const [tickerSearch, setTickerSearch] = useState('');
  const [quickTicker, setQuickTicker] = useState<string | null>(null);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [frameDropOpen, setFrameDropOpen] = useState(false);
  const frameDropRef = useRef<HTMLDivElement>(null);

  const [dateMode, setDateMode] = useState<'all' | 'today' | 'yesterday' | 'week'>('today');
  const [useDatePicker, setUseDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [useHour, setUseHour] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [showSeconds, setShowSeconds] = useState(false);
  const [filterValue, setFilterValue] = useState('All');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (frameDropRef.current && !frameDropRef.current.contains(e.target as Node))
        setFrameDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buildBody = useCallback(() => {
    let date_filter: string;
    if (useDatePicker && selectedDate) {
      date_filter = selectedDate;
    } else {
      date_filter = dateMode === 'today' ? 'max'
        : dateMode === 'yesterday' ? 'yesterday'
        : 'all';
    }

    let ticker: string[];
    if (quickTicker) {
      ticker = [quickTicker];
    } else if (tickerSearch.trim()) {
      ticker = tickerSearch.trim().toUpperCase().split(/[\s,]+/);
    } else {
      ticker = ['all'];
    }

    return {
      date_filter,
      ticker,
      frame: selectedFrames.length > 0 ? selectedFrames : ['all'],
      filter: filterValue === 'All' ? ['all'] : [filterValue],
      g_5d: false, l_5d: false, g_10d: false, l_10d: false,
      ...(useHour && selectedHour.trim() !== '' && { selected_hour: parseInt(selectedHour, 10) }),
    };
  }, [dateMode, useDatePicker, selectedDate, quickTicker, tickerSearch, selectedFrames, filterValue, useHour, selectedHour]);

  const fetchAlerts = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      else setLoading(true);
      setError(null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: 'POST', headers, body: JSON.stringify(buildBody()),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { status: string; data: AlertItem[] } = await res.json();
      setAlerts(data.data ?? []);
      setLastRefreshed(new Date());
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [buildBody]);

  useEffect(() => { fetchAlerts(); }, []);
  useEffect(() => {
    const id = setInterval(() => fetchAlerts(true), 60_000);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  const displayedAlerts = [...alerts]
    .filter(a => {
      if (!quickTicker && tickerSearch.trim())
        return a.ticker.toUpperCase().includes(tickerSearch.trim().toUpperCase());
      return true;
    })
    .sort((a, b) => {
      const diff = new Date(b.alert_time).getTime() - new Date(a.alert_time).getTime();
      return sortDir === 'desc' ? diff : -diff;
    });

  const refreshLabel = lastRefreshed
    ? `${String(lastRefreshed.getHours()).padStart(2,'0')}:${String(lastRefreshed.getMinutes()).padStart(2,'0')}`
    : null;

  const toggleFrame = (f: string) =>
    setSelectedFrames(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  // styles
  const th = "align-top px-4 py-2.5 text-white bg-[#145c38] border-r border-[#0e4429] last:border-r-0";
  const colInput = "w-full px-2 py-1 text-[11px] rounded border border-[#1a7a4a] bg-[#0d3d22] text-white placeholder:text-emerald-400 focus:outline-none focus:border-emerald-300";
  const radioLbl = "flex items-center gap-1 cursor-pointer text-[11px] text-emerald-100 font-medium whitespace-nowrap";

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'}`} dir="rtl">

      {/* Nav */}
      <div className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-5 justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDark(p => !p)} className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center">
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
          {onLogout && (
            <button onClick={onLogout} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500">
              <LogOut className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => fetchAlerts(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-xs text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            {refreshLabel ?? 'تحديث'}
          </button>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-white font-bold text-sm">
          <Bell className="w-4 h-4 text-red-500" /> التنبيهات والإشارات
        </div>
        <div className="w-28" />
      </div>

      <div className="flex flex-1">
        <AppSidebar navigate={navigate} onLogout={onLogout} user={user} activePage="alerts" />

        <main className="flex-1 p-4 overflow-auto min-w-0">

          {/* ── Quick Ticker Bar ── */}
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            {QUICK_TICKERS.map(t => (
              <button
                key={t}
                onClick={() => { setQuickTicker(prev => prev === t ? null : t); setTickerSearch(''); }}
                className={`px-5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  quickTicker === t
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-700'
                }`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => { setQuickTicker(null); setTickerSearch(''); }}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                quickTicker === null
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
              }`}
            >
              Show All
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* ── Table ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full font-bold">
                {loading ? '…' : `${displayedAlerts.length} إشارة`}
              </span>
              <div className="flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                {refreshLabel && <span className="text-xs text-slate-400 font-mono">آخر تحديث: {refreshLabel}</span>}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>

                    {/* ticker */}
                    <th className={th} style={{ width: '220px' }}>
                      <div className="text-xs font-bold mb-2">ticker</div>
                      <input
                        value={tickerSearch}
                        onChange={e => { setTickerSearch(e.target.value); setQuickTicker(null); }}
                        onKeyDown={e => e.key === 'Enter' && fetchAlerts()}
                        placeholder="Search tickers..."
                        className={colInput}
                      />
                    </th>

                    {/* frame */}
                    <th className={th} style={{ width: '170px' }}>
                      <div className="text-xs font-bold mb-2">frame</div>
                      <div className="relative" ref={frameDropRef}>
                        <button
                          onClick={() => setFrameDropOpen(p => !p)}
                          className="w-full flex items-center justify-between px-2 py-1 text-[11px] rounded border border-[#1a7a4a] bg-[#0d3d22] text-white hover:border-emerald-300 transition-colors"
                        >
                          <span className="truncate">
                            {selectedFrames.length === 0 ? 'Select Frames ▼' : selectedFrames.join(', ')}
                          </span>
                          <ChevronDown className="w-3 h-3 shrink-0 ml-1" />
                        </button>
                        {frameDropOpen && (
                          <div className="absolute top-full mt-1 left-0 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl py-1 min-w-[120px]">
                            {KNOWN_FRAMES.map(f => (
                              <label key={f} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer text-xs text-slate-700 dark:text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={selectedFrames.includes(f)}
                                  onChange={() => toggleFrame(f)}
                                  className="accent-emerald-600 w-3.5 h-3.5"
                                />
                                {f}
                              </label>
                            ))}
                            {selectedFrames.length > 0 && (
                              <button
                                onClick={() => setSelectedFrames([])}
                                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-slate-100 dark:border-slate-700 mt-0.5"
                              >
                                مسح الكل
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </th>

                    {/* datetime */}
                    <th className={th}>
                      <div
                        onClick={() => setSortDir(p => p === 'desc' ? 'asc' : 'desc')}
                        className="text-xs font-bold mb-2 cursor-pointer hover:text-emerald-200 select-none inline-flex items-center gap-1"
                      >
                        datetime {sortDir === 'desc' ? '↓' : '↑'}
                      </div>

                      {/* All / Today / Yesterday / Week */}
                      <div className="flex gap-3 flex-wrap mb-2">
                        {([
                          { v: 'all',       l: 'All'       },
                          { v: 'today',     l: 'Today'     },
                          { v: 'yesterday', l: 'Yesterday' },
                          { v: 'week',      l: 'Week'      },
                        ] as const).map(({ v, l }) => (
                          <label key={v} className={radioLbl}>
                            <input
                              type="radio"
                              name="dateMode"
                              value={v}
                              checked={dateMode === v}
                              onChange={() => { setDateMode(v); setUseDatePicker(false); }}
                              className="accent-white w-3 h-3"
                            />
                            {l}
                          </label>
                        ))}
                      </div>

                      {/* Date picker */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <input
                          type="checkbox"
                          checked={useDatePicker}
                          onChange={e => setUseDatePicker(e.target.checked)}
                          className="accent-white w-3 h-3 shrink-0"
                        />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={e => { setSelectedDate(e.target.value); setUseDatePicker(true); }}
                          disabled={!useDatePicker}
                          className="px-1.5 py-0.5 text-[11px] rounded border border-[#1a7a4a] bg-[#0d3d22] text-white focus:outline-none focus:border-emerald-300 disabled:opacity-40"
                        />
                      </div>

                      {/* Hour picker */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <input
                          type="checkbox"
                          checked={useHour}
                          onChange={e => setUseHour(e.target.checked)}
                          className="accent-white w-3 h-3 shrink-0"
                        />
                        <input
                          type="number"
                          min={0} max={23}
                          value={selectedHour}
                          onChange={e => setSelectedHour(e.target.value)}
                          placeholder="Hour"
                          disabled={!useHour}
                          className="w-20 px-1.5 py-0.5 text-[11px] rounded border border-[#1a7a4a] bg-[#0d3d22] text-white placeholder:text-emerald-500 focus:outline-none focus:border-emerald-300 disabled:opacity-40"
                        />
                      </div>

                      {/* Show seconds */}
                      <label className={radioLbl}>
                        <input
                          type="checkbox"
                          checked={showSeconds}
                          onChange={e => setShowSeconds(e.target.checked)}
                          className="accent-white w-3 h-3"
                        />
                        Show seconds
                      </label>
                    </th>

                    {/* filter */}
                    <th className={th} style={{ minWidth: '200px' }}>
                      <div className="text-xs font-bold mb-2">filter</div>
                      <select
                        value={filterValue}
                        onChange={e => setFilterValue(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] rounded border border-[#1a7a4a] bg-[#0d3d22] text-white focus:outline-none focus:border-emerald-300"
                      >
                        {KNOWN_FILTERS.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    : displayedAlerts.length === 0
                    ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-slate-400 text-sm">
                          لا توجد إشارات للفترة المحددة
                        </td>
                      </tr>
                    )
                    : displayedAlerts.map((alert, idx) => (
                        <tr
                          key={`${alert.ticker}-${alert.alert_time}-${idx}`}
                          className={`transition-colors ${
                            idx % 2 === 0
                              ? 'bg-white dark:bg-slate-800'
                              : 'bg-[#f0fdf4]/60 dark:bg-slate-800/40'
                          } hover:bg-emerald-50/70 dark:hover:bg-emerald-900/10`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <CompanyLogo ticker={alert.ticker} />
                              <span className="font-bold text-slate-800 dark:text-white text-xs">{alert.ticker}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-100 dark:border-emerald-800">
                              {alert.frame || '—'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300">
                            {formatAlertTime(alert.alert_time, showSeconds)}
                          </td>
                          <td className="py-2.5 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate" title={alert.filter}>
                            {alert.filter}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {!loading && displayedAlerts.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 flex items-center justify-between">
                <span>يتجدد تلقائياً كل دقيقة</span>
                <span>إجمالي: {displayedAlerts.length} إشارة</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}