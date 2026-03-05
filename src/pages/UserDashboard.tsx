import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Bell, Moon, Sun,
  Loader2, RefreshCw, LogOut,
} from 'lucide-react';
import QafahLogo from '@/components/Qafah_logo';
import { AppSidebar } from '@/components/AppSidebar';
import type { Last6DaysResponse, EmojiDay } from '@/types/message';
import type { AuthUser } from '@/hooks/useAuth';

interface TradingDateEntry {
  date: string;
  day_ar: string;
  day_short: string;
}
interface Last6DaysResponseExtended extends Last6DaysResponse {
  trading_dates?: Record<string, TradingDateEntry[]>;
}

const API_BASE = 'https://app.qafah.com';

// ─── Arabic months — 0-indexed to match JS Date.getUTCMonth() ────────────────
// IMPORTANT: always use getUTCMonth() / getUTCDate() when parsing ISO strings
// from the server, because new Date('2025-03-01T00:00:00') (no Z) is
// interpreted as LOCAL time by JS, shifting the date by UTC offset.
const AR_MONTHS_FE = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
];

/** Parse any date/datetime string and return { day, monthIdx } in UTC. */
function parseUtcDate(str: string): { day: number; monthIdx: number; year: number } | null {
  if (!str) return null;
  try {
    // If the string is a date-only "YYYY-MM-DD", parse directly to avoid
    // timezone interpretation issues entirely.
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (dateOnly) {
      return {
        year:     parseInt(dateOnly[1], 10),
        monthIdx: parseInt(dateOnly[2], 10) - 1,  // 0-indexed
        day:      parseInt(dateOnly[3], 10),
      };
    }
    // For datetime strings, always force UTC interpretation.
    const iso = str.endsWith('Z') || str.includes('+') ? str : str + 'Z';
    const d   = new Date(iso);
    return { year: d.getUTCFullYear(), monthIdx: d.getUTCMonth(), day: d.getUTCDate() };
  } catch {
    return null;
  }
}

function arDateFromStr(str: string): string {
  const p = parseUtcDate(str);
  if (!p) return str;
  return `${p.day} ${AR_MONTHS_FE[p.monthIdx]}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface UptrendRecord {
  date: string;
  window: number;
  QL: number;
  [key: string]: any;
}
interface ApiResponse {
  date: string;
  up_trend_sum: UptrendRecord[];
  windows: number[] | string;
}
interface EarningsCompany {
  ticker: string;
  name: string;
  change: number;
  time: string;
  earnings_date: string;
  earnings_date_ar: string;
}
interface EarningsResponse {
  count: number;
  earnings: EarningsCompany[];
  updated: string;
}
interface DividendCompany {
  ticker: string;
  name: string;
  dividend: number;
  ex_date: string;
  exDate: string;
}
interface DividendsResponse {
  count: number;
  dividends: DividendCompany[];
  updated: string;
}
interface AlertItem {
  ticker: string;
  alert_time: string;
  cp: string;
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
interface AlertsApiResponse {
  status: string;
  data: AlertItem[];
}
interface RawRow {
  holding_ticker: string;
  date: string;
  weight: number;
  load_level_state: string;
  load_direction: number;
  DiffCategory_1d: string;
  WeightChangePerc_5d: string;
  WeightChangePerc_3d: string;
  level_type: string;
}

const WINDOW_MAP: Record<string, number> = {
  'نطاق قريب': 3,
  'متوسط':     4,
  'بعيد':      10,
};

// ─── Signal types & badge ─────────────────────────────────────────────────────
type SignalState = 'accumulation' | 'pre-accumulation' | 'distribution' | 'pre-distribution' | 'neutral';
type SignalMap   = Record<string, SignalState>;

const SIGNAL_META: Record<SignalState, { label: string; isAccum: boolean }> = {
  'accumulation':     { label: 'تجميع',      isAccum: true  },
  'pre-accumulation': { label: 'قبل تجميع',  isAccum: true  },
  'distribution':     { label: 'تصريف',      isAccum: false },
  'pre-distribution': { label: 'قبل تصريف',  isAccum: false },
  'neutral':          { label: 'محايد',       isAccum: true  },
};

const SignalBadge = ({ state }: { state: SignalState | undefined }) => {
  if (!state) return null;
  const m = SIGNAL_META[state] ?? SIGNAL_META['neutral'];
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 ${
      m.isAccum
        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    }`}>
      {m.label}
    </span>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const UpTriangle   = () => <img src="https://app.qafah.com/static/TriUp.png" alt="up"   className="w-10 h-10" />;
const DownTriangle = () => <img src="https://app.qafah.com/static/TriDn.png" alt="down" className="w-10 h-10" />;
const NeutralCircle = () => (
  <svg width="10" height="10" viewBox="0 0 10 10">
    <circle cx="5" cy="5" r="4" fill="#94a3b8" />
  </svg>
);

const getLast6DaysWithNames = (
  data: EmojiDay[],
  tradingDates?: TradingDateEntry[]
): { day: EmojiDay; dayAr: string; dayShort: string; dateStr: string }[] => {
  return data.map((day, idx) => {
    if (tradingDates && tradingDates[idx]) {
      const td = tradingDates[idx];
      return { day, dayAr: td.day_ar, dayShort: td.day_short, dateStr: td.date };
    }
    const arDayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const today   = new Date();
    const daysAgo = data.length - 1 - idx;
    const dateObj = new Date(today);
    dateObj.setUTCDate(dateObj.getUTCDate() - daysAgo);
    return {
      day,
      dayAr:    arDayNames[dateObj.getUTCDay()],
      dayShort: `${dateObj.getUTCDate()} ${AR_MONTHS_FE[dateObj.getUTCMonth()]}`,
      dateStr:  dateObj.toISOString().slice(0, 10),
    };
  });
};

const CompanyLogo = ({ ticker }: { ticker: string }) => {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-600">
        {ticker.charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={`${API_BASE}/static/logos_tickers/${ticker}.png`}
      alt={ticker}
      className="w-8 h-8 rounded-xl object-cover"
      onError={() => setError(true)}
    />
  );
};

const formatXAxis = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    // Date-only string → safe to parse directly
    const [y, m] = dateStr.split('-');
    return `${AR_MONTHS_FE[parseInt(m, 10) - 1]} ${y}`;
  } catch { return dateStr; }
};

const sparseTicks = (dates: string[], count = 6): string[] => {
  if (!dates.length) return [];
  if (dates.length <= count) return dates;
  const step = Math.floor(dates.length / count);
  return dates.filter((_, i) => i % step === 0);
};

const parseEmojiString = (emojiStr: string): EmojiDay[] => {
  if (!emojiStr) return [];
  return emojiStr.trim().split(/\s+/).filter(Boolean).map(emoji => ({
    emoji,
    direction: emoji === '✅' ? 'up' : emoji === '🔻' ? 'down' : 'neutral' as 'up'|'down'|'neutral',
  })).reverse();
};

/** Format alert_time ISO string safely in UTC to avoid month shift. */
const formatAlertTime = (isoStr: string): { datePart: string; timePart: string } => {
  try {
    // Force UTC interpretation: append Z if no timezone marker present
    const safe = isoStr.endsWith('Z') || isoStr.includes('+') ? isoStr : isoStr + 'Z';
    const d    = new Date(safe);
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins  = String(d.getUTCMinutes()).padStart(2, '0');
    return {
      datePart: `${d.getUTCDate()} ${AR_MONTHS_FE[d.getUTCMonth()]}`,
      timePart: `${hours}:${mins}`,
    };
  } catch {
    return { datePart: isoStr, timePart: '' };
  }
};

const ChartLegend = ({ windowIndex, hKey, lKey }: { windowIndex: number; hKey: string; lKey: string }) => {
  const suffix = hKey.replace('h', '');
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 10, fontSize: 12, color: '#64748b' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#8b5cf6" strokeWidth="2.5" /><circle cx="14" cy="5" r="3.5" fill="#8b5cf6" /></svg>
        QAFAH {windowIndex}-يوم
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5 3" /></svg>
        High {suffix} {windowIndex}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3" opacity="0.55" /></svg>
        Low {suffix} {windowIndex}
      </span>
    </div>
  );
};

const SkeletonRow = () => (
  <div className="flex items-center justify-between animate-pulse">
    <div className="h-8 w-16 bg-slate-100 dark:bg-slate-700 rounded-lg" />
    <div className="flex items-center gap-2">
      <div className="h-4 w-20 bg-slate-100 dark:bg-slate-700 rounded" />
      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700" />
    </div>
  </div>
);

const AlertSkeletonRow = () => (
  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 animate-pulse">
    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-600 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="flex justify-between">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-600 rounded" />
        <div className="h-3 w-12 bg-slate-200 dark:bg-slate-600 rounded" />
      </div>
      <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-600 rounded" />
      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-600 rounded" />
    </div>
  </div>
);

const FrameBadge = ({ frame }: { frame: string }) => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold leading-none shrink-0">
    {frame ? `${frame}د` : '—'}
  </span>
);

type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
| 'admin-employees' | 'companies-accumulation' | 'premarket' | 'ticker-resell-signals';

interface UserDashboardProps {
  navigate: (page: Page) => void;
  onLogout?: () => void;
  user?: AuthUser | null;
}

// ─── Plotly ticker chart ──────────────────────────────────────────────────────
interface SignalPoint { date: string; weight: number; level: number }
interface ChartPayload {
  ticker: string; window: number;
  dates: string[]; weight: number[];
  high_3: number[]; low_3: number[];
  high_4: number[]; low_4: number[];
  signals: {
    positive_real: SignalPoint[]; negative_real: SignalPoint[];
    positive_internal: SignalPoint[]; negative_internal: SignalPoint[];
  };
}

function PlotlyTickerChart({ ticker, onClose }: { ticker: string; onClose: () => void }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'idle'>('loading');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (!document.getElementById('plotly-cdn')) {
      const s  = document.createElement('script');
      s.id     = 'plotly-cdn';
      s.src    = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('loading'); setErrMsg('');
      const Plotly = (window as any).Plotly;
      if (Plotly && divRef.current) Plotly.purge(divRef.current);

      let waited = 0;
      while (!(window as any).Plotly && waited < 6000) {
        await new Promise(r => setTimeout(r, 200)); waited += 200;
      }
      if (cancelled) return;
      const P = (window as any).Plotly;
      if (!P) { setErrMsg('Plotly CDN failed'); setStatus('error'); return; }

      try {
        const res = await fetch(`${API_BASE}/api/chart/${encodeURIComponent(ticker)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d: ChartPayload = await res.json();
        if (cancelled) return;

        const minW = Math.min(...d.weight.filter(v => isFinite(v)));
        const maxW = Math.max(...d.weight.filter(v => isFinite(v)));

        const traces = [
          { x: d.dates, y: d.weight, name: 'Load', type: 'scatter', mode: 'lines',
            line: { color: '#6941c6', width: 3, shape: 'spline' },
            fill: 'tozeroy', fillcolor: 'rgba(244,235,255,0.6)', hoverinfo: 'skip' },
          { x: d.dates, y: d.high_3, name: 'High W3', type: 'scatter', mode: 'lines',
            line: { color: '#1375c6d0', width: 1.5, dash: 'dot' }, hoverinfo: 'skip' },
          { x: d.dates, y: d.low_3, name: 'Low W3', type: 'scatter', mode: 'lines',
            line: { color: '#1374c6d0', width: 1.5, dash: 'dot' }, hoverinfo: 'skip' },
        ];
        const layout = {
          margin: { t: 10, b: 100, l: 40, r: 20 },
          xaxis: { showgrid: false },
          yaxis: { showgrid: true, gridcolor: '#dc8bff48', color: '#00000000', range: [minW * 0.95, maxW * 1.05] },
          hovermode: 'closest', showlegend: false, dragmode: 'pan',
          paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff', height: 320,
        };
        P.react(divRef.current, traces, layout, { displayModeBar: false, scrollZoom: true, responsive: true });
        setStatus('idle');
      } catch (e: any) {
        if (!cancelled) { setErrMsg(e.message ?? 'Unknown error'); setStatus('error'); }
      }
    })();
    return () => { cancelled = true; };
  }, [ticker]);

  return (
    <div className="relative" style={{ minHeight: 320 }}>
      <button
        onClick={onClose}
        className="absolute top-0 left-0 z-10 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        ← العودة لـ QAFAH
      </button>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 rounded-xl z-10">
          <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
          <span className="mr-3 text-sm text-slate-500">جاري تحميل الرسم…</span>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50/95 rounded-xl z-10 p-4">
          <p className="text-xs text-red-500 font-mono">{errMsg}</p>
          <button onClick={() => setStatus('loading')} className="text-xs underline text-slate-500">إعادة المحاولة</button>
        </div>
      )}
      <div ref={divRef} className="mt-7" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export function UserDashboard({ navigate, onLogout, user }: UserDashboardProps) {
  const [activePeriod, setActivePeriod]         = useState('نطاق قريب');
  const [isDark, setIsDark]                     = useState(false);
  const [selectedTicker, setSelectedTicker]     = useState<string | null>(null);

  const [rawData, setRawData]   = useState<UptrendRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [last6DaysData, setLast6DaysData] = useState<Last6DaysResponseExtended | null>(null);
  const [last6Loading, setLast6Loading]   = useState(true);

  const [earningsData, setEarningsData]       = useState<EarningsCompany[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError]     = useState<string | null>(null);

  const [dividendsData, setDividendsData]       = useState<DividendCompany[]>([]);
  const [dividendsLoading, setDividendsLoading] = useState(true);
  const [dividendsError, setDividendsError]     = useState<string | null>(null);

  const [alertsData, setAlertsData]       = useState<AlertItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError]     = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing]   = useState(false);

  const [myListData, setMyListData]       = useState<RawRow[]>([]);
  const [myListLoading, setMyListLoading] = useState(true);

  const [signalMap, setSignalMap] = useState<SignalMap>({});

  // ── Data fetches ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/ticker_resell_signals?mode=cached`)
      .then(r => r.json())
      .then((data: RawRow[]) => {
        const latestMap: Record<string, RawRow> = {};
        for (const row of data) {
          const existing = latestMap[row.holding_ticker];
          if (!existing || row.date > existing.date) latestMap[row.holding_ticker] = row;
        }
        const sm: SignalMap = {};
        for (const [ticker, row] of Object.entries(latestMap)) {
          sm[ticker] = row.load_level_state as SignalState;
        }
        setSignalMap(sm);
        const sorted = Object.values(latestMap).sort((a, b) => {
          const aIsAccum = a.load_level_state.includes('accumulation') ? 0 : 1;
          const bIsAccum = b.load_level_state.includes('accumulation') ? 0 : 1;
          if (aIsAccum !== bIsAccum) return aIsAccum - bIsAccum;
          return Math.abs(b.load_direction) - Math.abs(a.load_direction);
        });
        setMyListData(sorted.slice(0, 6));
      })
      .catch()
      .finally(() => setMyListLoading(false));
  }, []);

  const fetchAlerts = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      setAlertsError(null);
      const res = await fetch(`${API_BASE}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ['all'], frame: ['all'], filter: ['all'], date_filter: 'all' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AlertsApiResponse = await res.json();
      const sorted = [...(data.data ?? [])].sort(
        (a, b) => new Date(b.alert_time).getTime() - new Date(a.alert_time).getTime()
      ).slice(0, 10);
      setAlertsData(sorted);
      setLastRefreshed(new Date());
    } catch (e: any) {
      setAlertsError(e.message ?? 'Unknown error');
    } finally {
      setAlertsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setApiError(null);
        const res = await fetch(`${API_BASE}/api/etf/uptrend-sum?mode=cached`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        setRawData(data.up_trend_sum ?? []);
      } catch (e: any) { setApiError(e.message ?? 'Unknown error'); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLast6Loading(true);
        const res = await fetch(`${API_BASE}/api/etf/qafah-last-6-days`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setLast6DaysData(await res.json());
      } catch { }
      finally { setLast6Loading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setEarningsLoading(true); setEarningsError(null);
        const res = await fetch(`${API_BASE}/api/market/earnings`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: EarningsResponse = await res.json();
        setEarningsData(data.earnings ?? []);
      } catch (e: any) { setEarningsError(e.message ?? 'Unknown error'); }
      finally { setEarningsLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setDividendsLoading(true); setDividendsError(null);
        const res = await fetch(`${API_BASE}/api/market/dividends`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DividendsResponse = await res.json();
        setDividendsData(data.dividends ?? []);
      } catch (e: any) { setDividendsError(e.message ?? 'Unknown error'); }
      finally { setDividendsLoading(false); }
    })();
  }, []);

  // ── Chart data ──────────────────────────────────────────────────────────────
  const windowToKeys = useMemo<Record<number, { hKey: string; lKey: string }>>(() => {
    const map: Record<number, { hKey: string; lKey: string }> = {};
    for (const r of rawData) {
      const w = r.window as number;
      if (w !== undefined && !(w in map)) {
        const hKey = Object.keys(r).find(k => k.startsWith('h'));
        const lKey = Object.keys(r).find(k => k.startsWith('l'));
        if (hKey && lKey) map[w] = { hKey, lKey };
      }
    }
    return map;
  }, [rawData]);

  const windowIndex = WINDOW_MAP[activePeriod];
  const keys        = windowToKeys[windowIndex];
  const hKey        = keys?.hKey ?? '';
  const lKey        = keys?.lKey ?? '';

  const rechartsData = useMemo(() => {
    if (!rawData.length || !keys) return [];
    return rawData
      .filter(d => d.window === windowIndex)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ date: d.date, QL: d.QL, [hKey]: d[hKey], [lKey]: d[lKey] }));
  }, [rawData, windowIndex, keys]);

  const xTicks  = useMemo(() => sparseTicks(rechartsData.map(d => d.date)), [rechartsData]);
  const hasData = rechartsData.length >= 2 && hKey && lKey;

  const { last6Days, last6TradingDates } = useMemo(() => {
    if (!last6DaysData?.last_6_days) return { last6Days: [], last6TradingDates: undefined };
    const key      = `window_${windowIndex}` as keyof typeof last6DaysData.last_6_days;
    const emojiStr = last6DaysData.last_6_days[key];
    const days     = parseEmojiString(emojiStr || '');
    const dates    = last6DaysData.trading_dates?.[`window_${windowIndex}`];
    return { last6Days: days, last6TradingDates: dates };
  }, [last6DaysData, windowIndex]);

  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  const refreshedLabel = lastRefreshed
    ? `${String(lastRefreshed.getHours()).padStart(2,'0')}:${String(lastRefreshed.getMinutes()).padStart(2,'0')}`
    : null;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'}`} dir="rtl">

      {/* ── Top Nav ── */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors relative">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {alertsData.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              title="تسجيل الخروج"
              className="w-10 h-10 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
        <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
          👋 أهلاً، {user?.full_name ?? user?.username ?? 'حسن'}
          {user?.role === 'admin' && (
            <span className="mr-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
              أدمن
            </span>
          )}
        </span>
        <div className="w-24" />
      </div>

      <div className="flex flex-1">
        <AppSidebar navigate={navigate} onLogout={onLogout} user={user} activePage="dashboard" />

        {/* ── Main ── */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-6 mb-6">

            {/* ── Chart Card ── */}
            <div className="col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {selectedTicker ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CompanyLogo ticker={selectedTicker} />
                        <h2 className="font-bold text-slate-800 dark:text-white text-base">{selectedTicker}</h2>
                        <SignalBadge state={signalMap[selectedTicker]} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">رسم الحمل التفصيلي</p>
                    </>
                  ) : (
                    <>
                      <h2 className="font-bold text-slate-800 dark:text-white text-base">مقارنة مؤشرات QAFAH</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        النافذة الأساسية: {/*{windowIndex}{hKey ? ` — ${hKey} / ${lKey}` : ''}*/}
                      </p>
                    </>
                  )}
                </div>
                {!selectedTicker && (
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                    {Object.keys(WINDOW_MAP).map((period) => (
                      <button
                        key={period}
                        onClick={() => setActivePeriod(period)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activePeriod === period
                            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTicker ? (
                <PlotlyTickerChart ticker={selectedTicker} onClose={() => setSelectedTicker(null)} />
              ) : (
                <>
                  <div className="h-64 w-full">
                    {loading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                      </div>
                    ) : apiError ? (
                      <div className="h-full flex items-center justify-center text-xs text-red-500">خطأ: {apiError}</div>
                    ) : !hasData ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">لا توجد بيانات للنطاق المحدد</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rechartsData} margin={{ top: 20, right: 16, left: 0, bottom: 20 }} onContextMenu={(_, e) => e.preventDefault()}>
                          <defs>
                            <linearGradient id="colorQL" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                          <XAxis
                            dataKey="date"
                            ticks={xTicks}
                            tickFormatter={formatXAxis}
                            tick={{ fontSize: 11, fill: tickColor }}
                            axisLine={{ stroke: gridColor }}
                            tickLine={false}
                            label={{ value: 'التاريخ', position: 'insideBottom', offset: -12, fontSize: 11, fill: tickColor }}
                          />
                          {/*
                            Y-axis: hide labels but keep axis for scale.
                            width={0} removes the dead space that was causing
                            horizontal scrolling inside the card.
                          */}
                          <YAxis
                            tick={false}
                            axisLine={false}
                            tickLine={false}
                            width={0}
                          />
                          <Tooltip
                            content={() => null}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 2' }}
                          />
                          <Area type="monotone"  dataKey="QL"   stroke="#8b5cf6" strokeWidth={2}   fillOpacity={1} fill="url(#colorQL)" isAnimationActive={false} dot={false} />
                          <Area type="stepAfter" dataKey={hKey} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="7 4" fill="none" isAnimationActive={false} dot={false} />
                          <Area type="stepAfter" dataKey={lKey} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="7 4" strokeOpacity={0.55} fill="none" isAnimationActive={false} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/*!loading && !apiError && hasData && (
                    <ChartLegend windowIndex={windowIndex} hKey={hKey} lKey={lKey} />
                  )*/}

                  <div className="mt-6">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">آخر 6 أيام</p>
                    {last6Loading ? (
                      <div className="flex items-center justify-center h-16">
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                      </div>
                    ) : last6Days.length === 0 ? (
                      <div className="text-xs text-slate-400">لا توجد بيانات</div>
                    ) : (
                      <div className="flex gap-1 justify-between w-full">
                        {getLast6DaysWithNames(last6Days, last6TradingDates).map((item, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                            {item.day.direction === 'up'
                              ? <UpTriangle />
                              : item.day.direction === 'down'
                              ? <DownTriangle />
                              : <NeutralCircle />}
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{item.dayAr}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">{item.dayShort}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ── قائمتي ── */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">إدارة القائمة ←</button>
                <h2 className="font-bold text-slate-800 dark:text-white text-base">قائمتي</h2>
              </div>
              <div className="flex flex-col gap-2">
                {myListLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : myListData.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">لا توجد بيانات</p>
                ) : (
                  myListData.map((c, idx) => {
                    const dir = c.load_direction;
                    return (
                      <div
                        key={c.holding_ticker}
                        className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl px-2 -mx-2 transition-colors"
                        onClick={() => setSelectedTicker(c.holding_ticker)}
                        title={`عرض رسم ${c.holding_ticker}`}
                      >
                        <span className="text-xs text-slate-500 w-4 text-center shrink-0">{idx + 1}</span>
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          <CompanyLogo ticker={c.holding_ticker} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{c.holding_ticker}</p>
                          <p className="text-xs text-slate-400 truncate">{c.DiffCategory_1d}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <SignalBadge state={signalMap[c.holding_ticker]} />
                          <span className={`text-xs font-bold ${dir > 0 ? 'text-green-500' : dir < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {dir > 0 ? '+' : ''}{dir}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom Grid ── */}
          <div className="grid grid-cols-3 gap-6">

            {/* Earnings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                  {earningsLoading ? '…' : `${earningsData.length} شركة`}
                </span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">إعلانات الأرباح</h3>
              </div>
              <div className="flex flex-col gap-3 mt-4 overflow-y-auto overflow-x-hidden max-h-72 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
                {earningsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                ) : earningsError ? (
                  <p className="text-xs text-red-400 text-center py-4">فشل تحميل البيانات</p>
                ) : earningsData.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">لا توجد إعلانات قريبة</p>
                ) : (
                  earningsData.map((c) => (
                    <div
                      key={c.ticker}
                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl px-2 -mx-2 py-1 transition-colors shrink-0"
                      onClick={() => setSelectedTicker(c.ticker)}
                      title={`عرض رسم ${c.ticker}`}
                    >
                      <CompanyLogo ticker={c.ticker} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{c.ticker}</p>
                          <SignalBadge state={signalMap[c.ticker]} />
                        </div>
                        <p className="text-xs text-slate-400 truncate leading-tight">{c.name}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className={`text-sm font-bold leading-tight ${c.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {c.change >= 0 ? '+' : ''}{c.change}%
                        </p>
                        <p className="text-xs text-slate-400 leading-tight">{c.time}</p>
                        {/* Use arDateFromStr as extra safety net on top of backend value */}
                        <p className="text-xs text-blue-400 font-medium leading-tight">
                          {arDateFromStr(c.earnings_date)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dividends */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                  {dividendsLoading ? '…' : `${dividendsData.length} شركة`}
                </span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">التوزيعات النقدية</h3>
              </div>
<div className="flex flex-col gap-3 mt-4 overflow-y-auto overflow-x-hidden max-h-72 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">                {dividendsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                ) : dividendsError ? (
                  <p className="text-xs text-red-400 text-center py-4">فشل تحميل البيانات</p>
                ) : dividendsData.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">لا توجد توزيعات قريبة</p>
                ) : (
                  dividendsData.map((c) => (
                    <div
                      key={c.ticker}
                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl px-2 -mx-2 py-1 transition-colors shrink-0"
                      onClick={() => setSelectedTicker(c.ticker)}
                      title={`عرض رسم ${c.ticker}`}
                    >
                      <CompanyLogo ticker={c.ticker} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{c.ticker}</p>
                          <SignalBadge state={signalMap[c.ticker]} />
                        </div>
                        <p className="text-xs text-slate-400 truncate leading-tight">{c.name}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-sm font-bold text-green-600 dark:text-green-400 leading-tight">${c.dividend}</p>
                        {/* Use arDateFromStr as extra safety net on top of backend value */}
                        <p className="text-xs text-slate-400 leading-tight">
                          {arDateFromStr(c.ex_date)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
                    {alertsLoading ? '…' : `${alertsData.length} إشارة`}
                  </span>
                  <button
                    onClick={() => fetchAlerts(true)}
                    disabled={isRefreshing}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    title="تحديث يدوي"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">التنبيهات والإشارات</h3>
              </div>

              {refreshedLabel && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-left mb-2 leading-none">
                  آخر تحديث: {refreshedLabel}
                </p>
              )}

              <div className="flex flex-col gap-2 mt-1 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
                {alertsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <AlertSkeletonRow key={i} />)
                ) : alertsError ? (
                  <p className="text-xs text-red-400 text-center py-4">فشل تحميل البيانات</p>
                ) : alertsData.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">لا توجد إشارات</p>
                ) : (
                  alertsData.map((alert, idx) => {
                    const { datePart, timePart } = formatAlertTime(alert.alert_time);
                    return (
                      <div
                        key={`${alert.ticker}-${alert.alert_time}-${idx}`}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                        onClick={() => setSelectedTicker(alert.ticker)}
                        title={`عرض رسم ${alert.ticker}`}
                      >
                        <CompanyLogo ticker={alert.ticker} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-sm font-bold text-slate-800 dark:text-white leading-tight shrink-0">{alert.ticker}</span>
                              <FrameBadge frame={alert.frame} />
                            </div>
                            <div className="text-left shrink-0">
                              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">{datePart}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{timePart}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">{alert.filter}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}