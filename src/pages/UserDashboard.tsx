import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Bell, Moon, Sun, Activity, Star,
  Home, Phone, GraduationCap, ChevronDown, ChevronUp,
  Settings, PieChart, Loader2
} from 'lucide-react';
import QafahLogo from '@/components/Qafah_logo';
import type { Last6DaysResponse, EmojiDay } from '@/types/message';

const API_BASE = 'https://app.qafah.com';

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

// Arabic label → window INDEX value in record.window
const WINDOW_MAP: Record<string, number> = {
  'نطاق قريب': 3,
  'متوسط':     4,
  'بعيد':      10,
};

// ─── Static data ──────────────────────────────────────────────────────────────
const myListCompanies = [
  { index: 1, symbol: 'AAPL', name: 'Apple',     ticker: 'AAPL', signal: 'accumulation', change:  2.45 },
  { index: 2, symbol: 'NVDA', name: 'NVIDIA',    ticker: 'NVDA', signal: 'accumulation', change:  3.21 },
  { index: 3, symbol: 'META', name: 'Meta',      ticker: 'META', signal: 'distribution', change: -1.23 },
  { index: 4, symbol: 'MSFT', name: 'Microsoft', ticker: 'MSFT', signal: 'accumulation', change:  1.67 },
  { index: 5, symbol: 'AMD',  name: 'AMD',       ticker: 'AMD',  signal: 'distribution', change: -2.84 },
  { index: 6, symbol: 'AMZN', name: 'Amazon',    ticker: 'AMZN', signal: 'accumulation', change:  1.89 },
];

const earningsCompanies = [
  { ticker: 'ADBE', name: 'Adobe',      change:  5.82, time: 'بعد الإغلاق' },
  { ticker: 'CRM',  name: 'Salesforce', change:  3.45, time: 'بعد الإغلاق' },
];

const dividendCompanies = [
  { ticker: 'AAPL', name: 'Apple',     dividend: 0.26, exDate: '09 فبراير' },
  { ticker: 'MSFT', name: 'Microsoft', dividend: 0.83, exDate: '20 فبراير' },
];

const alertsData = [
  { id: 1, symbol: 'AAPL', time: '2m ago',  message: 'Broke above resistance at 228.50', icon: TrendingUp },
  { id: 2, symbol: 'NVDA', time: '5m ago',  message: 'Unusual volume detected (+340%)',  icon: Activity   },
  { id: 3, symbol: 'META', time: '12m ago', message: 'Distribution pattern forming',     icon: Star       },
];

type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
  | 'admin-employees' | 'companies-accumulation' | 'premarket';

interface UserDashboardProps {
  navigate: (page: Page) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Image-based indicators
const UpTriangle = () => (
  <img src="data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='24' height='24' rx='8' fill='%2322c55e'/%3E%3Cpath d='M12 7L18 16H6L12 7Z' fill='white'/%3E%3C/svg%3E" alt="up" className="w-6 h-6" />
);
const DownTriangle = () => (
  <img src="data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='24' height='24' rx='8' fill='%23ef4444'/%3E%3Cpath d='M12 17L6 8H18L12 17Z' fill='white'/%3E%3C/svg%3E" alt="down" className="w-6 h-6" />
);
const NeutralCircle = () => (
  <svg width="10" height="10" viewBox="0 0 10 10">
    <circle cx="5" cy="5" r="4" fill="#94a3b8" />
  </svg>
);

// Helper to get last 6 days with Arabic names
const getLast6DaysWithNames = (data: EmojiDay[]): { day: EmojiDay; dateObj: Date; arName: string }[] => {
  const arNames = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const today = new Date();
  
  return data.map((day, idx) => {
    const daysAgo = data.length - 1 - idx;
    const dateObj = new Date(today);
    dateObj.setDate(dateObj.getDate() - daysAgo);
    const dayOfWeek = dateObj.getDay();
    const arName = arNames[dayOfWeek];
    
    return { day, dateObj, arName };
  });
};

// Logo component with fallback
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
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return dateStr; }
};

const sparseTicks = (dates: string[], count = 6): string[] => {
  if (!dates.length) return [];
  if (dates.length <= count) return dates;
  const step = Math.floor(dates.length / count);
  return dates.filter((_, i) => i % step === 0);
};

// ─── Parse emoji string to array ──────────────────────────────────────────────
const parseEmojiString = (emojiStr: string): EmojiDay[] => {
  if (!emojiStr) return [];
  
  // Split by whitespace and filter empty strings
  const emojis = emojiStr.trim().split(/\s+/).filter(Boolean);
  
  const parsed = emojis.map(emoji => {
    let direction: 'up' | 'down' | 'neutral' = 'neutral';
    
    if (emoji === '✅') direction = 'up';
    else if (emoji === '🔻') direction = 'down';
    
    return { emoji, direction };
  });
  
  // REVERSE the array because RTL layout reverses visual order
  return parsed.reverse();
};
// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({
  active, payload, label, windowIndex, hKey, lKey
}: any) => {
  if (!active || !payload?.length) return null;
  const get = (key: string) => payload.find((p: any) => p.dataKey === key)?.value;
  const ql   = get('QL');
  const high = get(hKey);
  const low  = get(lKey);
  const suffix = hKey?.replace('h', '');
  return (
    <div
      dir="rtl"
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '10px 14px',
        minWidth: 210,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        fontSize: 12,
      }}
    >
      <p style={{ color: '#64748b', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {ql   != null && <p style={{ color: '#3b82f6', fontWeight: 700 }}>QAFAH {windowIndex}-يوم : {Number(ql).toFixed(3)}</p>}
      {high != null && <p style={{ color: '#22c55e', fontWeight: 600 }}>High {suffix} {windowIndex} : {Number(high).toFixed(3)}</p>}
      {low  != null && <p style={{ color: '#16a34a' }}>Low {suffix} {windowIndex} : {Number(low).toFixed(3)}</p>}
    </div>
  );
};

// ─── Custom Legend ────────────────────────────────────────────────────────────
const ChartLegend = ({ windowIndex, hKey, lKey }: { windowIndex: number; hKey: string; lKey: string }) => {
  const suffix = hKey.replace('h', '');
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 10, fontSize: 12, color: '#64748b' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="28" height="10">
          <line x1="0" y1="5" x2="28" y2="5" stroke="#3b82f6" strokeWidth="2.5" />
          <circle cx="14" cy="5" r="3.5" fill="#3b82f6" />
        </svg>
        QAFAH {windowIndex}-يوم
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="28" height="10">
          <line x1="0" y1="5" x2="28" y2="5" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="5 3" />
        </svg>
        High {suffix} {windowIndex}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="28" height="10">
          <line x1="0" y1="5" x2="28" y2="5" stroke="#22c55e" strokeWidth="2" strokeDasharray="5 3" opacity="0.55" />
        </svg>
        Low {suffix} {windowIndex}
      </span>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
export function UserDashboard({ navigate }: UserDashboardProps) {
  const [activePeriod, setActivePeriod]   = useState('نطاق قريب');
  const [isDark, setIsDark]               = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(['portfolio', 'education']);
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const [rawData, setRawData]   = useState<UptrendRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // NEW: Last 6 days state
  const [last6DaysData, setLast6DaysData] = useState<Last6DaysResponse | null>(null);
  const [last6Loading, setLast6Loading] = useState(true);

  // ── Fetch uptrend data ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setApiError(null);
        const res = await fetch('https://app.qafah.com/api/etf/uptrend-sum?mode=cached');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        setRawData(data.up_trend_sum ?? []);
      } catch (e: any) {
        setApiError(e.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Fetch last 6 days ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLast6Loading(true);
        const res = await fetch('https://app.qafah.com/api/etf/qafah-last-6-days');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Last6DaysResponse = await res.json();
        setLast6DaysData(data);
      } catch (e: any) {
        console.error('Failed to fetch last 6 days:', e);
      } finally {
        setLast6Loading(false);
      }
    })();
  }, []);

  // ── windowIndex → actual column names ─────────────────────────────────────
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

  // ── Recharts dataset ──────────────────────────────────────────────────────
  const rechartsData = useMemo(() => {
    if (!rawData.length || !keys) return [];
    return rawData
      .filter(d => d.window === windowIndex)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ date: d.date, QL: d.QL, [hKey]: d[hKey], [lKey]: d[lKey] }));
  }, [rawData, windowIndex, keys]);

  const xTicks = useMemo(
    () => sparseTicks(rechartsData.map(d => d.date)),
    [rechartsData]
  );

  const hasData = rechartsData.length >= 2 && hKey && lKey;

  // ── Parse last 6 days for current window ──────────────────────────────────
  const last6Days = useMemo(() => {
    if (!last6DaysData?.last_6_days) return [];
    const key = `window_${windowIndex}` as keyof typeof last6DaysData.last_6_days;
    const emojiStr = last6DaysData.last_6_days[key];
    return parseEmojiString(emojiStr || '');
  }, [last6DaysData, windowIndex]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleMenu = (menu: string) =>
    setExpandedMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );

  const getSignalBadge = (signal: string, change: number) => {
    const isAcc = signal === 'accumulation';
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isAcc
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {isAcc ? 'تجميع' : 'تصريف'}
        </span>
        <span className={`text-xs font-semibold ${
          isAcc ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isAcc ? '+' : ''}{change}%
        </span>
      </div>
    );
  };

  // ── Tick color ────────────────────────────────────────────────────────────
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'}`} dir="rtl">

      {/* Top Nav */}
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
        <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">👋 أهلاً، حسن</span>
        <div className="w-24" />
      </div>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col py-4 px-3 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 pb-4 pt-1">
            <QafahLogo className="w-28 text-slate-800 dark:text-white" />
          </div>

          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm w-full">
            <Home className="w-4 h-4" /> لوحة التحكم
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm w-full">
            <Phone className="w-4 h-4" /> Calls
          </button>

          <div>
            <button onClick={() => toggleMenu('portfolio')} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="flex items-center gap-3 text-sm"><PieChart className="w-4 h-4" /> محفظتي</span>
              {expandedMenus.includes('portfolio') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedMenus.includes('portfolio') && (
              <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 dark:border-slate-700 pr-3">
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">الأسواق</button>
                <button onClick={() => navigate('companies-accumulation')} className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">فاحص السوق</button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm w-full">
            <Activity className="w-4 h-4" /> Indicators Alerts
          </button>

          <div>
            <button onClick={() => toggleMenu('education')} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="flex items-center gap-3 text-sm"><GraduationCap className="w-4 h-4" /> التعليم</span>
              {expandedMenus.includes('education') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedMenus.includes('education') && (
              <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 dark:border-slate-700 pr-3">
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">Academy</button>
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">Tutorials</button>
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">Meeting</button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm w-full mt-auto">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-6 mb-6">

            {/* ── Chart Card ── */}
            <div className="col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-base">
                    مقارنة مؤشرات QAFAH
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    النافذة الأساسية: {windowIndex}
                    {hKey ? ` — ${hKey} / ${lKey}` : ''}
                  </p>
                </div>
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
              </div>

              {/* Recharts AreaChart */}
              <div className="h-64 w-full">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : apiError ? (
                  <div className="h-full flex items-center justify-center text-xs text-red-500">خطأ: {apiError}</div>
                ) : !hasData ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">لا توجد بيانات للنطاق المحدد</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={rechartsData} 
                      margin={{ top: 20, right: 16, left: 0, bottom: 20 }}
                      onContextMenu={(_, e) => e.preventDefault()}
                    >
                      <defs>
                        <linearGradient id="colorQL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
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

                      <YAxis
                        tick={{ fontSize: 11, fill: tickColor }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                        label={{ value: 'إجمالي الصاعد', angle: -90, position: 'insideLeft', offset: 14, fontSize: 11, fill: tickColor }}
                      />

                      <Tooltip
                        content={<CustomTooltip windowIndex={windowIndex} hKey={hKey} lKey={lKey} />}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 2' }}
                      />

                      {/* Main area - QL value */}
                      <Area
                        type="monotone"
                        dataKey="QL"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorQL)"
                        isAnimationActive={false}
                        dot={false}
                      />

                      {/* High range area */}
                      <Area
                        type="stepAfter"
                        dataKey={hKey}
                        stroke="#22c55e"
                        strokeWidth={1.5}
                        strokeDasharray="7 4"
                        fill="none"
                        isAnimationActive={false}
                        dot={false}
                      />

                      {/* Low range area */}
                      <Area
                        type="stepAfter"
                        dataKey={lKey}
                        stroke="#22c55e"
                        strokeWidth={1.5}
                        strokeDasharray="7 4"
                        strokeOpacity={0.55}
                        fill="none"
                        isAnimationActive={false}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend */}
              {!loading && !apiError && hasData && (
                <ChartLegend windowIndex={windowIndex} hKey={hKey} lKey={lKey} />
              )}

              {/* Last 6 days - stretched */}
              <div className="mt-6">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">آخر 6 أيام</p>
                {last6Loading ? (
                  <div className="flex items-center justify-center h-16">
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  </div>
                ) : last6Days.length === 0 ? (
                  <div className="text-xs text-slate-400">لا توجد بيانات</div>
                ) : (
                  <div className="flex gap-2 justify-between w-full">
                    {getLast6DaysWithNames(last6Days).map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1">
                        {item.day.direction === 'up' ? (
                          <UpTriangle />
                        ) : item.day.direction === 'down' ? (
                          <DownTriangle />
                        ) : (
                          <NeutralCircle />
                        )}
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium text-center">{item.arName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* My List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">إدارة القائمة ←</button>
                <h2 className="font-bold text-slate-800 dark:text-white text-base">قائمتي</h2>
              </div>
              <div className="flex flex-col gap-2">
                {myListCompanies.map((c) => (
                  <div key={c.index} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                    {getSignalBadge(c.signal, c.change)}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.symbol}</p>
                      </div>
                      <CompanyLogo ticker={c.ticker} />
                      <span className="text-xs text-slate-300 dark:text-slate-600 w-4 text-center">{c.index}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-3 gap-6">

            {/* Earnings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">4 شركة</span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">إعلانات الأرباح</h3>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {earningsCompanies.map((c) => (
                  <div key={c.ticker} className="flex items-center justify-between">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${c.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {c.change >= 0 ? '+' : ''}{c.change}%
                      </span>
                      <p className="text-xs text-slate-400">{c.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{c.ticker}</p>
                        <p className="text-xs text-slate-400">{c.name}</p>
                      </div>
                      <CompanyLogo ticker={c.ticker} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dividends */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">4 شركة</span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">التوزيعات النقدية</h3>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {dividendCompanies.map((c) => (
                  <div key={c.ticker} className="flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">${c.dividend}</span>
                      <p className="text-xs text-slate-400">{c.exDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{c.ticker}</p>
                        <p className="text-xs text-slate-400">{c.name}</p>
                      </div>
                      <CompanyLogo ticker={c.ticker} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">12 جديد</span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">التنبيهات والإشارات</h3>
              </div>
              <div className="flex flex-col gap-3 mt-3">
                {alertsData.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div key={alert.id} className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <Icon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-slate-400">{alert.time}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{alert.symbol}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed truncate">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}