import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp, TrendingDown, Bell, Info, Moon, Sun, Activity, Star,
  DollarSign, Megaphone, Home, Phone, GraduationCap, ChevronDown,
  ChevronUp, Settings, PieChart, Loader2
} from 'lucide-react';
import QafahLogo from '@/components/Qafah_logo';

// --- Types ---
interface UptrendRecord {
  date: string;
  window: number;
  QL: number;
  [key: string]: any; // h5, l5, h10, l10, etc.
}

interface ApiResponse {
  date: string;
  up_trend_sum: UptrendRecord[];
  windows: number[] | string;
}

// Maps Arabic label → window INDEX value stored in record.window
const WINDOW_MAP: Record<string, number> = {
  'نطاق قريب': 3,
  'متوسط':     4,
  'بعيد':      10,
};

// --- Static mock data ---
const myListCompanies = [
  { index: 1, symbol: 'AAPL', name: 'Apple',     logo: '🍎', signal: 'accumulation', change: 2.45  },
  { index: 2, symbol: 'NVDA', name: 'NVIDIA',    logo: '🎮', signal: 'accumulation', change: 3.21  },
  { index: 3, symbol: 'META', name: 'Meta',      logo: '👥', signal: 'distribution', change: -1.23 },
  { index: 4, symbol: 'MSFT', name: 'Microsoft', logo: '💻', signal: 'accumulation', change: 1.67  },
  { index: 5, symbol: 'AMD',  name: 'AMD',       logo: '🔷', signal: 'distribution', change: -2.84 },
  { index: 6, symbol: 'AMZN', name: 'Amazon',    logo: '📦', signal: 'accumulation', change: 1.89  },
];

const earningsCompanies = [
  { ticker: 'ADBE', name: 'Adobe',      logo: '🎨', change: 5.82,  eps: '$4.38', time: 'بعد الإغلاق' },
  { ticker: 'CRM',  name: 'Salesforce', logo: '☁️', change: 3.45,  eps: '$2.78', time: 'بعد الإغلاق' },
];

const dividendCompanies = [
  { ticker: 'AAPL', name: 'Apple',     logo: '🍎', dividend: 0.26, exDate: '09 فبراير', yield: '0.52%' },
  { ticker: 'MSFT', name: 'Microsoft', logo: '💻', dividend: 0.83, exDate: '20 فبراير', yield: '0.72%' },
];

const last6Days = [
  { day: 'الجمعة',   direction: 'down' },
  { day: 'الخميس',   direction: 'down' },
  { day: 'الثلاثاء', direction: 'up'   },
  { day: 'الأربعاء', direction: 'up'   },
  { day: 'الإثنين',  direction: 'up'   },
  { day: 'الأحد',    direction: 'up'   },
];

const alerts = [
  { id: 1, symbol: 'AAPL', time: '2m ago',  message: 'Broke above resistance at 228.50', type: 'breakout', icon: TrendingUp },
  { id: 2, symbol: 'NVDA', time: '5m ago',  message: 'Unusual volume detected (+340%)',  type: 'volume',   icon: Activity   },
  { id: 3, symbol: 'META', time: '12m ago', message: 'Distribution pattern forming',     type: 'pattern',  icon: Star       },
];

// --- Types ---
type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
  | 'admin-employees' | 'companies-accumulation' | 'premarket';

interface UserDashboardProps {
  navigate: (page: Page) => void;
}

// --- Small Components ---
const UpTriangle = () => (
  <svg width="10" height="10" viewBox="0 0 10 10">
    <polygon points="5,0 10,10 0,10" fill="#22c55e" />
  </svg>
);

const DownTriangle = () => (
  <svg width="10" height="10" viewBox="0 0 10 10">
    <polygon points="0,0 10,0 5,10" fill="#ef4444" />
  </svg>
);

const QafahWatermark = ({ className = '' }: { className?: string }) => (
  <div className={`flex flex-col items-center opacity-10 pointer-events-none select-none ${className}`}>
    <svg viewBox="0 0 120 40" className="w-32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0"  y="0" width="8" height="8" rx="1" fill="#3b82f6" />
      <rect x="10" y="0" width="8" height="8" rx="1" fill="#3b82f6" opacity="0.6" />
      <circle cx="9" cy="22" r="8" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
      <line x1="14" y1="27" x2="18" y2="31" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
      <text x="24" y="28" fontFamily="serif" fontWeight="bold" fontSize="14" fill="currentColor">QAFAH</text>
    </svg>
    <span className="text-xs font-bold tracking-widest mt-1">QAFAH</span>
  </div>
);

// ============================================================
export function UserDashboard({ navigate }: UserDashboardProps) {
  const [activePeriod, setActivePeriod] = useState('نطاق قريب');
  const [isDark, setIsDark] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(['portfolio', 'education']);

  // API State
  const [chartData, setChartData] = useState<UptrendRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [apiError, setApiError]   = useState<string | null>(null);

  // ── Fetch all records (no window filter) ──────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiError(null);
        const response = await fetch('https://app.qafah.com/api/etf/uptrend-sum?mode=cached');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: ApiResponse = await response.json();
        console.log('API Response:', data);
        setChartData(data.up_trend_sum || []);
      } catch (error: any) {
        console.error('Failed to fetch uptrend data:', error);
        setApiError(error.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Build map: window index → actual h* key (e.g. 3 → "h5") ─────────────
  // This handles the mismatch between record.window (index) and column name (h5).
  const windowToHKey = useMemo<Record<number, string>>(() => {
    if (!chartData.length) return {};
    const map: Record<number, string> = {};
    for (const record of chartData) {
      const w = record.window as number;
      if (w !== undefined && !(w in map)) {
        const hKey = Object.keys(record).find(k => k.startsWith('h'));
        if (hKey) map[w] = hKey;
      }
    }
    console.log('windowToHKey map:', map);
    return map;
  }, [chartData]);

  // ── Generate SVG line path ────────────────────────────────────────────────
  const { generatedPath, areaPath, chartMin, chartMax } = useMemo(() => {
    const empty = { generatedPath: '', areaPath: '', chartMin: 0, chartMax: 0 };
    if (!chartData.length) return empty;

    const windowIndex = WINDOW_MAP[activePeriod];
    const hKey = windowToHKey[windowIndex];

    if (!hKey) {
      console.warn(`No h* key found for window index ${windowIndex}. Map:`, windowToHKey);
      return empty;
    }

    // Isolate records belonging to this window, sorted by date ascending
    const points = chartData
      .filter(d => d.window === windowIndex && d[hKey] !== undefined)
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log(`Window ${windowIndex} → key ${hKey} → ${points.length} points`);
    if (points.length < 2) return empty;

    const WIDTH   = 300;
    const HEIGHT  = 200;
    const PADDING = 20;

    const values  = points.map(d => d[hKey] as number);
    const maxVal  = Math.max(...values);
    const minVal  = Math.min(...values);
    const range   = maxVal - minVal || 1; // avoid /0 for flat data

    const toX = (i: number) => (i / (points.length - 1)) * (WIDTH - 40);
    const toY = (v: number) =>
      HEIGHT - (((v - minVal) / range) * (HEIGHT - PADDING * 2)) - PADDING;

    const lineParts = points.map((d, i) => {
      const x = toX(i);
      const y = toY(d[hKey] as number);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    });

    const linePath = lineParts.join(' ');
    const lastX    = toX(points.length - 1).toFixed(2);
    const bottomY  = HEIGHT;
    const area     = `${linePath} L${lastX},${bottomY} L0,${bottomY} Z`;

    return {
      generatedPath: linePath,
      areaPath:      area,
      chartMin:      minVal,
      chartMax:      maxVal,
    };
  }, [chartData, activePeriod, windowToHKey]);

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

  // ── Current hKey label for subtitle ──────────────────────────────────────
  const activeHKey = windowToHKey[WINDOW_MAP[activePeriod]] ?? '…';

  // ============================================================
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'}`} dir="rtl">

      {/* ── Top Navigation ── */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            {isDark
              ? <Sun  className="w-5 h-5 text-yellow-400" />
              : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors relative">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">👋 أهلاً، أحمد</span>
        </div>
        <div className="w-24" />
      </div>

      <div className="flex flex-1">

        {/* ── Right Sidebar ── */}
        <aside className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col py-4 px-3 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 pb-4 pt-1">
            <QafahLogo className="w-28 text-slate-800 dark:text-white" />
          </div>

          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm w-full">
            <Home className="w-4 h-4" />
            لوحة التحكم
          </button>

          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm w-full">
            <Phone className="w-4 h-4" />
            Calls
          </button>

          {/* Portfolio submenu */}
          <div>
            <button
              onClick={() => toggleMenu('portfolio')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="flex items-center gap-3 text-sm">
                <PieChart className="w-4 h-4" />
                محفظتي
              </span>
              {expandedMenus.includes('portfolio')
                ? <ChevronUp   className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedMenus.includes('portfolio') && (
              <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 dark:border-slate-700 pr-3">
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full">
                  الأسواق
                </button>
                <button
                  onClick={() => navigate('companies-accumulation')}
                  className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full"
                >
                  فاحص السوق
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm w-full">
            <Activity className="w-4 h-4" />
            Indicators Alerts
          </button>

          {/* Education submenu */}
          <div>
            <button
              onClick={() => toggleMenu('education')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="flex items-center gap-3 text-sm">
                <GraduationCap className="w-4 h-4" />
                التعليم
              </span>
              {expandedMenus.includes('education')
                ? <ChevronUp   className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedMenus.includes('education') && (
              <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 dark:border-slate-700 pr-3">
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full">Academy</button>
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full">Tutorials</button>
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full">Meeting</button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm w-full mt-auto">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-6 mb-6">

            {/* ── Chart Card ── */}
            <div className="col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-base">شارت قافة</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تحليل تراكمي — window index: {WINDOW_MAP[activePeriod]}
                    {activeHKey !== '…' && ` (${activeHKey})`}
                  </p>
                </div>

                {/* Period selector */}
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

              {/* Chart area */}
              <div className="relative h-52 rounded-xl bg-slate-50 dark:bg-slate-900/50 overflow-hidden flex items-center justify-center">
                {loading ? (
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                ) : apiError ? (
                  <p className="text-xs text-red-500">خطأ: {apiError}</p>
                ) : !generatedPath ? (
                  <p className="text-xs text-slate-400">
                    لا توجد بيانات للنطاق المحدد
                    {activeHKey !== '…' ? ` (${activeHKey})` : ''}
                  </p>
                ) : (
                  <>
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <QafahWatermark className="text-slate-800 dark:text-white" />
                    </div>

                    {/* Y-axis labels */}
                    <div className="absolute right-2 top-0 h-full flex flex-col justify-between py-2 text-xs text-slate-400">
                      <span>{chartMax.toFixed(2)}</span>
                      <span>{((chartMax + chartMin) / 2).toFixed(2)}</span>
                      <span>{chartMin.toFixed(2)}</span>
                    </div>

                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-2 pr-10">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="border-t border-slate-200 dark:border-slate-700 w-full" />
                      ))}
                    </div>

                    {/* SVG chart */}
                    <svg
                      className="absolute inset-0 w-full h-full pr-10"
                      preserveAspectRatio="none"
                      viewBox="0 0 300 200"
                    >
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"   />
                        </linearGradient>
                      </defs>
                      <path d={areaPath}      fill="url(#chartGrad)" />
                      <path
                        d={generatedPath}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </div>

              {/* Last 6 days */}
              <div className="mt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">آخر 6 أيام</p>
                <div className="flex gap-2">
                  {last6Days.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                        day.direction === 'up'
                          ? 'bg-green-50 dark:bg-green-900/30'
                          : 'bg-red-50 dark:bg-red-900/30'
                      }`}>
                        {day.direction === 'up' ? <UpTriangle /> : <DownTriangle />}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── My List Card ── */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">إدارة القائمة ←</button>
                <h2 className="font-bold text-slate-800 dark:text-white text-base">قائمتي</h2>
              </div>
              <div className="flex flex-col gap-2">
                {myListCompanies.map((company) => (
                  <div key={company.index} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-1.5">
                      {getSignalBadge(company.signal, company.change)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{company.name}</p>
                        <p className="text-xs text-slate-400">{company.symbol}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">{company.logo}</div>
                      <span className="text-xs text-slate-300 dark:text-slate-600 w-4 text-center">{company.index}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom Grid ── */}
          <div className="grid grid-cols-3 gap-6">

            {/* Earnings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">4 شركة</span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">إعلانات الأرباح</h3>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {earningsCompanies.map((company) => (
                  <div key={company.ticker} className="flex items-center justify-between">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${company.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {company.change >= 0 ? '+' : ''}{company.change}%
                      </span>
                      <p className="text-xs text-slate-400">{company.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{company.ticker}</p>
                        <p className="text-xs text-slate-400">{company.name}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">{company.logo}</div>
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
                {dividendCompanies.map((company) => (
                  <div key={company.ticker} className="flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">${company.dividend}</span>
                      <p className="text-xs text-slate-400">{company.exDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{company.ticker}</p>
                        <p className="text-xs text-slate-400">{company.name}</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">{company.logo}</div>
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
                {alerts.map((alert) => {
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