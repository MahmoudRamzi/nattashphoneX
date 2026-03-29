import { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun, LogOut, RefreshCw, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import type { AuthUser } from '@/hooks/useAuth';

const API_BASE = 'https://app.qafah.com';

type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
  | 'admin-employees' | 'companies-accumulation' | 'premarket'
  | 'ticker-resell-signals' | 'loads-detail' | 'crossing-report' | 'etfs-report';

interface LoadItem {
  ticker: string;
  date: string;
  sector?: string;
  industry?: string;
  DDC?: number;
  hd?: number;
  QLD1D?: number;
  QLD5D?: number;
  QLD10D?: number;
  QLD1D_date?: string;
  QLD5D_date?: string;
  QLD10D_date?: string;
  QLD1d_label?: string;
  QLD5d_label?: string;
  QLD10d_label?: string;
  G5d?: boolean;
  L5d?: boolean;
  G10d?: boolean;
  L10d?: boolean;
  QL?: number;
  [key: string]: any;
}

interface LoadsPageProps {
  navigate: (page: Page) => void;
  onLogout?: () => void;
  user?: AuthUser | null;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDate(str: string) {
  try {
    const d = new Date(str.includes('T') ? str : str + 'T00:00:00Z');
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch { return str; }
}

function getToken() {
  return localStorage.getItem('access_token') || localStorage.getItem('token') || '';
}

const CompanyLogo = ({ ticker }: { ticker?: string }) => {
  const [err, setErr] = useState(false);
  const safe = ticker ?? '';
  if (!safe || err) return (
    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-white shrink-0">
      {safe ? safe.charAt(0) : '?'}
    </div>
  );
  return (
    <img
      src={`${API_BASE}/static/logos_tickers/${safe}.png`}
      alt={safe}
      className="w-7 h-7 rounded-lg object-cover shrink-0"
      onError={() => setErr(true)}
    />
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 9 }).map((_, i) => (
      <td key={i} className="py-3 px-3">
        <div className="h-4 bg-slate-100 dark:bg-slate-700/60 rounded" />
      </td>
    ))}
  </tr>
);

type TabKey = 'all' | 'g5d' | 'l5d' | 'g10d' | 'l10d';

interface ColFilters {
  tickerSearch: string;
  filterDate: string;
  sortByDate: boolean;
  ddcSign: 'all' | '+' | '-';
  ddcMin: string;
  ddcMax: string;
  diff1dSign: 'all' | '+' | '-';
  diff1dLabel: 'all' | 'Low' | 'Medium' | 'High' | 'Major';
  hdMin: string;
  hdMax: string;
  hdSign: 'all' | '+' | '-';
  gl5: 'all' | 'gainers' | 'losers' | 'empty';
  diff5dSign: 'all' | '+' | '-';
  diff5dLabel: 'all' | 'Low' | 'Medium' | 'High' | 'Major';
  gl10: 'all' | 'gainers' | 'losers' | 'empty';
  diff10dSign: 'all' | '+' | '-';
  diff10dLabel: 'all' | 'Low' | 'Medium' | 'High' | 'Major';
}

const defaultFilters: ColFilters = {
  tickerSearch: '',
  filterDate: '',
  sortByDate: true,
  ddcSign: 'all', ddcMin: '', ddcMax: '',
  diff1dSign: 'all', diff1dLabel: 'all',
  hdMin: '', hdMax: '', hdSign: 'all',
  gl5: 'all',
  diff5dSign: 'all', diff5dLabel: 'all',
  gl10: 'all',
  diff10dSign: 'all', diff10dLabel: 'all',
};

// ─── Main component ────────────────────────────────────────────────────────────
export function LoadsPage({ navigate, onLogout, user }: LoadsPageProps) {
  const [isDark, setIsDark] = useState(false);
  const [rawData, setRawData] = useState<LoadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [mode, setMode] = useState<'cached' | 'recalculate'>('cached');
  const [cf, setCf] = useState<ColFilters>(defaultFilters);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  // ── are any column filters active? ──────────────────────────────────────
  const hasColFilter =
    cf.tickerSearch.trim() !== '' ||
    cf.filterDate !== '' ||
    cf.ddcSign !== 'all' || cf.ddcMin !== '' || cf.ddcMax !== '' ||
    cf.diff1dSign !== 'all' || cf.diff1dLabel !== 'all' ||
    cf.hdMin !== '' || cf.hdMax !== '' || cf.hdSign !== 'all' ||
    cf.gl5 !== 'all' ||
    cf.diff5dSign !== 'all' || cf.diff5dLabel !== 'all' ||
    cf.gl10 !== 'all' ||
    cf.diff10dSign !== 'all' || cf.diff10dLabel !== 'all';

  // ── fetch from API ───────────────────────────────────────────────────────
  // When no filter → ask API for 'yesterday' only (fast, small payload)
  // When any filter → ask API for 'all' dates so client can filter across history
  const fetchLoads = useCallback(async (opts?: { spinner?: boolean; allDates?: boolean }) => {
    const { spinner = false, allDates = false } = opts ?? {};
    try {
      if (spinner) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body: Record<string, unknown> = {
        filter_date: allDates ? 'all' : 'yesterday',
      };

      const res = await fetch(`${API_BASE}/api/loads?mode=${mode}&limit=5000`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: { status: string; data: LoadItem[] } = await res.json();
      setRawData(json.data ?? []);
      setLastRefreshed(new Date());
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [mode]);

  // initial load — yesterday only
  useEffect(() => { fetchLoads({ allDates: false }); }, []);

  // when filters are first activated → re-fetch all dates
  // when filters are all cleared → re-fetch yesterday only
  const prevHasColFilter = useRef<boolean>(false);
  useEffect(() => {
    if (prevHasColFilter.current === hasColFilter) return;
    prevHasColFilter.current = hasColFilter;
    fetchLoads({ allDates: hasColFilter });
  }, [hasColFilter]);

  // ── client-side filtering ─────────────────────────────────────────────────
  const labelMap: Record<string, string> = {
    Low: 'LOW', Medium: 'MEDIUM', High: 'HIGH', Major: 'MAJOR',
  };

  const filtered = rawData.filter(item => {
    if (activeTab === 'g5d'  && !item.G5d)  return false;
    if (activeTab === 'l5d'  && !item.L5d)  return false;
    if (activeTab === 'g10d' && !item.G10d) return false;
    if (activeTab === 'l10d' && !item.L10d) return false;

    if (cf.tickerSearch.trim()) {
      if (!item.ticker?.toUpperCase().includes(cf.tickerSearch.trim().toUpperCase())) return false;
    }
    if (cf.filterDate && formatDate(item.date) !== cf.filterDate) return false;

    if (cf.ddcSign === '+' && (item.DDC ?? 0) <= 0) return false;
    if (cf.ddcSign === '-' && (item.DDC ?? 0) >= 0) return false;
    if (cf.ddcMin !== '' && (item.DDC ?? 0) < Number(cf.ddcMin)) return false;
    if (cf.ddcMax !== '' && (item.DDC ?? 0) > Number(cf.ddcMax)) return false;

    if (cf.diff1dSign === '+' && (item.QLD1D ?? 0) <= 0) return false;
    if (cf.diff1dSign === '-' && (item.QLD1D ?? 0) >= 0) return false;
    if (cf.diff1dLabel !== 'all' && (item.QLD1d_label ?? '').toUpperCase() !== labelMap[cf.diff1dLabel]) return false;

    if (cf.hdSign === '+' && (item.hd ?? 0) <= 0) return false;
    if (cf.hdSign === '-' && (item.hd ?? 0) >= 0) return false;
    if (cf.hdMin !== '' && (item.hd ?? 0) < Number(cf.hdMin)) return false;
    if (cf.hdMax !== '' && (item.hd ?? 0) > Number(cf.hdMax)) return false;

    if (cf.gl5 === 'gainers' && !item.G5d)  return false;
    if (cf.gl5 === 'losers'  && !item.L5d)  return false;
    if (cf.gl5 === 'empty'   && (item.G5d || item.L5d)) return false;

    if (cf.diff5dSign === '+' && (item.QLD5D ?? 0) <= 0) return false;
    if (cf.diff5dSign === '-' && (item.QLD5D ?? 0) >= 0) return false;
    if (cf.diff5dLabel !== 'all' && (item.QLD5d_label ?? '').toUpperCase() !== labelMap[cf.diff5dLabel]) return false;

    if (cf.gl10 === 'gainers' && !item.G10d) return false;
    if (cf.gl10 === 'losers'  && !item.L10d) return false;
    if (cf.gl10 === 'empty'   && (item.G10d || item.L10d)) return false;

    if (cf.diff10dSign === '+' && (item.QLD10D ?? 0) <= 0) return false;
    if (cf.diff10dSign === '-' && (item.QLD10D ?? 0) >= 0) return false;
    if (cf.diff10dLabel !== 'all' && (item.QLD10d_label ?? '').toUpperCase() !== labelMap[cf.diff10dLabel]) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    cf.sortByDate
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : (b.DDC ?? 0) - (a.DDC ?? 0)
  );

  // tab counts (from raw data, ignoring col filters for count display)
  const counts = {
    all:  rawData.length,
    g5d:  rawData.filter(r => r.G5d).length,
    l5d:  rawData.filter(r => r.L5d).length,
    g10d: rawData.filter(r => r.G10d).length,
    l10d: rawData.filter(r => r.L10d).length,
  };
  const g5dLoadSum = rawData.filter(r => r.G5d).reduce((s, r) => s + (r.QL ?? 0), 0);

  const refreshLabel = lastRefreshed
    ? `${String(lastRefreshed.getHours()).padStart(2,'0')}:${String(lastRefreshed.getMinutes()).padStart(2,'0')}`
    : null;

  const upd = <K extends keyof ColFilters>(key: K, val: ColFilters[K]) =>
    setCf(p => ({ ...p, [key]: val }));

  // reusable radio components
  const SignRadio = ({ field, value }: { field: keyof ColFilters; value: string }) => (
    <label className="flex items-center gap-0.5 cursor-pointer">
      <input
        type="radio"
        name={String(field)}
        value={value}
        checked={(cf[field] as string) === value}
        onChange={() => upd(field as any, value as any)}
        className="accent-emerald-400 w-3 h-3"
      />
      <span className="text-[11px] text-emerald-100">
        {value === 'all' ? 'All' : value}
      </span>
    </label>
  );

  const LabelRadio = ({ field, value, label }: { field: keyof ColFilters; value: string; label: string }) => (
    <label className="flex items-center gap-0.5 cursor-pointer">
      <input
        type="radio"
        name={`lbl_${String(field)}`}
        value={value}
        checked={(cf[field] as string) === value}
        onChange={() => upd(field as any, value as any)}
        className="accent-emerald-400 w-3 h-3"
      />
      <span className="text-[11px] text-emerald-100">{label}</span>
    </label>
  );

  const th = "align-top px-3 py-2 text-left text-white bg-[#1a5c3a] border-r border-emerald-800 last:border-r-0";
  const filterInput = "mt-1 w-full px-1.5 py-0.5 text-[11px] rounded border border-emerald-700 bg-emerald-900/60 text-white placeholder:text-emerald-400 focus:outline-none focus:border-emerald-400";
  const smallInput = "w-14 px-1 py-0.5 text-[11px] rounded border border-emerald-700 bg-emerald-900/60 text-white placeholder:text-emerald-400 focus:outline-none";

  const pctCell = (val?: number, label?: string, dateStr?: string) => {
    if (val === undefined || val === null) return <span className="text-slate-400">—</span>;
    const color = val > 0 ? 'text-emerald-400' : val < 0 ? 'text-red-400' : 'text-slate-400';
    const sign = val >= 0 ? '+' : '';
    const d = dateStr ? ` [${String(dateStr).slice(5, 10)}]` : '';
    return (
      <span className={`font-mono text-[11px] font-semibold whitespace-nowrap ${color}`}>
        {sign}{val.toFixed(5)}%{label ? ` (${label})` : ''}{d}
      </span>
    );
  };

  const ddcCell = (val?: number) => {
    if (val === undefined || val === null) return <span className="text-slate-400 text-xs">—</span>;
    const color = val > 0 ? 'text-emerald-400' : val < 0 ? 'text-red-400' : 'text-slate-400';
    return <span className={`font-mono text-xs font-bold ${color}`}>{val}</span>;
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'}`} dir="rtl">

      {/* ── Nav ── */}
      <div className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-5 justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(p => !p)}
            className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
          {onLogout && (
            <button onClick={onLogout} className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-red-500">
              <LogOut className="w-4 h-4" />
            </button>
          )}
          <select
            value={mode}
            onChange={e => setMode(e.target.value as any)}
            className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <option value="cached">مخزن مؤقت</option>
            <option value="recalculate">إعادة حساب</option>
          </select>
          <button
            onClick={() => fetchLoads({ spinner: true, allDates: hasColFilter })}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-xs text-slate-600 dark:text-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            {refreshLabel ?? 'تحديث'}
          </button>
          {hasColFilter && (
            <button
              onClick={() => {
                setCf(defaultFilters);
                // will trigger useEffect → fetch yesterday
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100"
            >
              ✕ مسح الفلاتر
            </button>
          )}
        </div>
        <span className="font-bold text-slate-700 dark:text-white text-sm">جدول الأحمال التفصيلي</span>
        <div className="w-28" />
      </div>

      <div className="flex flex-1">
        <AppSidebar navigate={navigate} onLogout={onLogout} user={user} activePage="loads-detail" />

        <main className="flex-1 p-4 overflow-auto min-w-0">

          {/* ── Tabs ── */}
          <div className="flex flex-wrap gap-2 mb-4">
            {([
              { key: 'all',  label: `All (${counts.all})` },
              { key: 'g5d',  label: `Top 5d Gainers over All (${counts.g5d}) - loads sum : ${g5dLoadSum.toFixed(3)}` },
              { key: 'l5d',  label: `Top 5d Losers over All (${counts.l5d})` },
              { key: 'g10d', label: `Top 10d Gainers (${counts.g10d})` },
              { key: 'l10d', label: `Top 10d Losers (${counts.l10d})` },
            ] as { key: TabKey; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  activeTab === tab.key
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                    : 'bg-white dark:bg-slate-800 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* ── Table ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 overflow-hidden">

            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                {loading ? '…' : `${sorted.length} سهم`}
              </span>
              <span className="text-xs text-slate-400">
                {hasColFilter ? '📂 كل التواريخ' : '📅 أمس فقط'}
              </span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>

                    {/* holding_ticker */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1 whitespace-nowrap">holding_ticker</div>
                      <input
                        value={cf.tickerSearch}
                        onChange={e => upd('tickerSearch', e.target.value)}
                        placeholder="بحث رمز..."
                        className={filterInput}
                      />
                    </th>

                    {/* date */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1">date</div>
                      <input
                        type="date"
                        value={cf.filterDate}
                        onChange={e => upd('filterDate', e.target.value)}
                        className={filterInput}
                      />
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <label className="flex items-center gap-0.5 cursor-pointer">
                          <input type="radio" name="sortDate" checked={cf.sortByDate} onChange={() => upd('sortByDate', true)} className="accent-emerald-400 w-3 h-3" />
                          <span className="text-[11px] text-emerald-100">Date ↓</span>
                        </label>
                        <label className="flex items-center gap-0.5 cursor-pointer">
                          <input type="radio" name="sortDate" checked={!cf.sortByDate} onChange={() => upd('sortByDate', false)} className="accent-emerald-400 w-3 h-3" />
                          <span className="text-[11px] text-emerald-100">D D Counter ↑</span>
                        </label>
                      </div>
                    </th>

                    {/* daily direction counter */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1 whitespace-nowrap">daily direction counter</div>
                      <div className="flex gap-2 flex-wrap">
                        <SignRadio field="ddcSign" value="all" />
                        <SignRadio field="ddcSign" value="+" />
                        <SignRadio field="ddcSign" value="-" />
                      </div>
                      <div className="flex gap-1 mt-1">
                        <input value={cf.ddcMin} onChange={e => upd('ddcMin', e.target.value)} placeholder="more th" className={smallInput} />
                        <input value={cf.ddcMax} onChange={e => upd('ddcMax', e.target.value)} placeholder="less tha" className={smallInput} />
                      </div>
                    </th>

                    {/* load diff 1d */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1 whitespace-nowrap">load diff 1d %</div>
                      <div className="flex gap-2 flex-wrap mb-1">
                        <SignRadio field="diff1dSign" value="all" />
                        <SignRadio field="diff1dSign" value="+" />
                        <SignRadio field="diff1dSign" value="-" />
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <LabelRadio field="diff1dLabel" value="all"    label="All" />
                        <LabelRadio field="diff1dLabel" value="Low"    label="Low" />
                        <LabelRadio field="diff1dLabel" value="Medium" label="Medium" />
                        <LabelRadio field="diff1dLabel" value="High"   label="High" />
                        <LabelRadio field="diff1dLabel" value="Major"  label="Major" />
                      </div>
                    </th>

                    {/* hitting_days */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1">hitting_days</div>
                      <div className="flex gap-2 flex-wrap">
                        <SignRadio field="hdSign" value="all" />
                        <SignRadio field="hdSign" value="+" />
                        <SignRadio field="hdSign" value="-" />
                      </div>
                      <div className="flex gap-1 mt-1">
                        <input value={cf.hdMin} onChange={e => upd('hdMin', e.target.value)} placeholder="more th" className={smallInput} />
                        <input value={cf.hdMax} onChange={e => upd('hdMax', e.target.value)} placeholder="less tha" className={smallInput} />
                      </div>
                    </th>

                    {/* Top G/L 5Days */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1 whitespace-nowrap">Top G/L 5Days</div>
                      <div className="flex flex-col gap-0.5">
                        {(['all','gainers','losers','empty'] as const).map(v => (
                          <label key={v} className="flex items-center gap-0.5 cursor-pointer">
                            <input type="radio" name="gl5" value={v} checked={cf.gl5 === v} onChange={() => upd('gl5', v)} className="accent-emerald-400 w-3 h-3" />
                            <span className="text-[11px] text-emerald-100 capitalize">{v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}</span>
                          </label>
                        ))}
                      </div>
                    </th>

                    {/* load diff 5d */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1 whitespace-nowrap">load diff 5d %</div>
                      <div className="flex gap-2 flex-wrap mb-1">
                        <SignRadio field="diff5dSign" value="all" />
                        <SignRadio field="diff5dSign" value="+" />
                        <SignRadio field="diff5dSign" value="-" />
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <LabelRadio field="diff5dLabel" value="all"    label="All" />
                        <LabelRadio field="diff5dLabel" value="Low"    label="Low" />
                        <LabelRadio field="diff5dLabel" value="Medium" label="Medium" />
                        <LabelRadio field="diff5dLabel" value="High"   label="High" />
                        <LabelRadio field="diff5dLabel" value="Major"  label="Major" />
                      </div>
                    </th>

                    {/* Top G/L 10days */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1 whitespace-nowrap">Top G/L 10days</div>
                      <div className="flex flex-col gap-0.5">
                        {(['all','gainers','losers','empty'] as const).map(v => (
                          <label key={v} className="flex items-center gap-0.5 cursor-pointer">
                            <input type="radio" name="gl10" value={v} checked={cf.gl10 === v} onChange={() => upd('gl10', v)} className="accent-emerald-400 w-3 h-3" />
                            <span className="text-[11px] text-emerald-100 capitalize">{v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}</span>
                          </label>
                        ))}
                      </div>
                    </th>

                    {/* load diff 10d */}
                    <th className={th}>
                      <div className="text-[11px] font-bold mb-1 whitespace-nowrap">load diff 10d %</div>
                      <div className="flex gap-2 flex-wrap mb-1">
                        <SignRadio field="diff10dSign" value="all" />
                        <SignRadio field="diff10dSign" value="+" />
                        <SignRadio field="diff10dSign" value="-" />
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <LabelRadio field="diff10dLabel" value="all"    label="All" />
                        <LabelRadio field="diff10dLabel" value="Low"    label="Low" />
                        <LabelRadio field="diff10dLabel" value="Medium" label="Medium" />
                        <LabelRadio field="diff10dLabel" value="High"   label="High" />
                        <LabelRadio field="diff10dLabel" value="Major"  label="Major" />
                      </div>
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                  {loading
                    ? Array.from({ length: 12 }).map((_, i) => <SkeletonRow key={i} />)
                    : sorted.length === 0
                    ? (
                      <tr>
                        <td colSpan={9} className="text-center py-16 text-slate-400 text-sm">
                          لا توجد بيانات للمعايير المحددة
                        </td>
                      </tr>
                    )
                    : sorted.map((item, idx) => (
                        <tr
                          key={`${item.ticker}-${item.date}-${idx}`}
                          className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <CompanyLogo ticker={item.ticker} />
                              <span className="font-bold text-slate-800 dark:text-white text-xs">{item.ticker}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(item.date)}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            {ddcCell(item.DDC)}
                          </td>

                          <td className="py-2.5 px-3">
                            {pctCell(item.QLD1D, item.QLD1d_label, item.QLD1D_date)}
                          </td>

                          <td className="py-2.5 px-3 text-center text-xs text-slate-600 dark:text-slate-300">
                            {item.hd ?? '—'}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex justify-center">
                              {item.G5d
                                ? <Check className="w-4 h-4 text-emerald-500" />
                                : item.L5d
                                ? <X className="w-4 h-4 text-red-500" />
                                : <X className="w-4 h-4 text-slate-200 dark:text-slate-600" />}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            {pctCell(item.QLD5D, item.QLD5d_label, item.QLD5D_date)}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="flex justify-center">
                              {item.G10d
                                ? <Check className="w-4 h-4 text-emerald-500" />
                                : item.L10d
                                ? <X className="w-4 h-4 text-red-500" />
                                : <X className="w-4 h-4 text-slate-200 dark:text-slate-600" />}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            {pctCell(item.QLD10D, item.QLD10d_label, item.QLD10D_date)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {!loading && sorted.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 flex items-center justify-between">
                <span>{mode === 'cached' ? 'مخزنة مؤقتاً' : 'محسوبة حديثاً'}</span>
                <span>إجمالي: {sorted.length} سهم</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}