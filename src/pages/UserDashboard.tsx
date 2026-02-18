import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp, TrendingDown, Bell, Info, Moon, Sun, Activity, Star,
  DollarSign, Megaphone, Home, Phone, GraduationCap, ChevronDown,
  ChevronUp, Settings, PieChart
} from 'lucide-react';

// بيانات قائمتي (My List)
const myListCompanies = [
  { index: 1, symbol: 'AAPL', name: 'Apple',     logo: '🍎', signal: 'accumulation', signalText: 'تجميع',  change: 2.45  },
  { index: 2, symbol: 'NVDA', name: 'NVIDIA',    logo: '🎮', signal: 'accumulation', signalText: 'تجميع',  change: 3.21  },
  { index: 3, symbol: 'META', name: 'Meta',      logo: '👥', signal: 'distribution', signalText: 'تصريف', change: -1.23 },
  { index: 4, symbol: 'MSFT', name: 'Microsoft', logo: '💻', signal: 'accumulation', signalText: 'تجميع',  change: 1.67  },
  { index: 5, symbol: 'AMD',  name: 'AMD',       logo: '🔷', signal: 'distribution', signalText: 'تصريف', change: -2.84 },
  { index: 6, symbol: 'AMZN', name: 'Amazon',    logo: '📦', signal: 'accumulation', signalText: 'تجميع',  change: 1.89  },
];

// بيانات الشركات ذات الإعلانات
const earningsCompanies = [
  { ticker: 'ADBE', name: 'Adobe',      logo: '🎨', change: 5.82,  eps: '$4.38', time: 'بعد الإغلاق' },
  { ticker: 'CRM',  name: 'Salesforce', logo: '☁️', change: 3.45,  eps: '$2.78', time: 'بعد الإغلاق' },
];

// بيانات التوزيعات النقدية
const dividendCompanies = [
  { ticker: 'AAPL', name: 'Apple',     logo: '🍎', dividend: 0.26, exDate: '09 فبراير', yield: '0.52%' },
  { ticker: 'MSFT', name: 'Microsoft', logo: '💻', dividend: 0.83, exDate: '20 فبراير', yield: '0.72%' },
];

// بيانات آخر 6 أيام
const last6Days = [
  { day: 'الجمعة',  direction: 'down' },
  { day: 'الخميس',  direction: 'down' },
  { day: 'الثلاثاء', direction: 'up'   },
  { day: 'الأربعاء', direction: 'up'   },
  { day: 'الإثنين', direction: 'up'   },
  { day: 'الأحد',   direction: 'up'   },
];

// التنبيهات والإشارات
const alerts = [
  { id: 1, symbol: 'AAPL', time: '2m ago',  message: 'Broke above resistance at 228.50', type: 'breakout', icon: TrendingUp },
  { id: 2, symbol: 'NVDA', time: '5m ago',  message: 'Unusual volume detected (+340%)',  type: 'volume',   icon: Activity   },
  { id: 3, symbol: 'META', time: '12m ago', message: 'Distribution pattern forming',     type: 'pattern',  icon: Star       },
];

type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
  | 'admin-employees' | 'companies-accumulation' | 'premarket';

interface UserDashboardProps {
  navigate: (page: Page) => void;
}

// مكون مثلث صاعد
const UpTriangle = () => (
  <svg width="10" height="10" viewBox="0 0 10 10">
    <polygon points="5,0 10,10 0,10" fill="#22c55e" />
  </svg>
);

// مكون مثلث هابط
const DownTriangle = () => (
  <svg width="10" height="10" viewBox="0 0 10 10">
    <polygon points="0,0 10,0 5,10" fill="#ef4444" />
  </svg>
);

// شعار قافة للشريط الجانبي
const QafahLogo = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 120 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* المربعات العلوية */}
    <rect x="0"  y="0" width="8" height="8" rx="1" fill="#3b82f6" />
    <rect x="10" y="0" width="8" height="8" rx="1" fill="#3b82f6" opacity="0.6" />
    {/* الحرف Q الرئيسي */}
    <circle cx="9" cy="22" r="8" stroke="#3b82f6" strokeWidth="2.5" fill="none" />
    <line x1="14" y1="27" x2="18" y2="31" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
    {/* النص QAFAH */}
    <text x="24" y="28" fontFamily="serif" fontWeight="bold" fontSize="14" fill="currentColor">QAFAH</text>
  </svg>
);

// شعار قافة للعلامة المائية
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

export function UserDashboard({ navigate }: UserDashboardProps) {
  const [activePeriod, setActivePeriod] = useState('نطاق قريب');
  const [isDark, setIsDark] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(['portfolio', 'education']);

  const showAllAlerts = false;
  const displayedAlerts = showAllAlerts ? alerts : alerts.slice(0, 3);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const getSignalBadge = (signal: string, change: number) => {
    if (signal === 'accumulation') {
      return (
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
            تجميع
          </span>
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold">+{change}%</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
          تصريف
        </span>
        <span className="text-xs text-red-600 dark:text-red-400 font-semibold">{change}%</span>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'}`} dir="rtl">

      {/* Top Navigation */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-6 justify-between sticky top-0 z-10 shadow-sm">
        {/* Left Side - Icons */}
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

        {/* Center - Welcome */}
        <div className="flex items-center gap-2">
          <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">👋 أهلاً، أحمد</span>
        </div>

        {/* Right Side */}
        <div className="w-24" />
      </div>

      <div className="flex flex-1">

        {/* Right Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col py-4 px-3 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">

          {/* Logo */}
          <div className="px-4 pb-4 pt-1">
            <QafahLogo className="w-28 text-slate-800 dark:text-white" />
          </div>

          {/* Dashboard */}
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold text-sm w-full">
            <Home className="w-4 h-4" />
            لوحة التحكم
          </button>

          {/* Calls */}
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm w-full">
            <Phone className="w-4 h-4" />
            Calls
          </button>

          {/* Portfolio - Expandable */}
          <div>
            <button
              onClick={() => toggleMenu('portfolio')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="flex items-center gap-3 text-sm">
                <PieChart className="w-4 h-4" />
                محفظتي
              </span>
              {expandedMenus.includes('portfolio') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedMenus.includes('portfolio') && (
              <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 dark:border-slate-700 pr-3">
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full">
                  الأسواق
                </button>
                {/* ✅ فاحص السوق navigates to companies-accumulation */}
                <button
                  onClick={() => navigate('companies-accumulation')}
                  className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full"
                >
                  فاحص السوق
                </button>
              </div>
            )}
          </div>

          {/* Indicators Alerts */}
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm w-full">
            <Activity className="w-4 h-4" />
            Indicators Alerts
          </button>

          {/* Education - Expandable */}
          <div>
            <button
              onClick={() => toggleMenu('education')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="flex items-center gap-3 text-sm">
                <GraduationCap className="w-4 h-4" />
                التعليم
              </span>
              {expandedMenus.includes('education') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedMenus.includes('education') && (
              <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 dark:border-slate-700 pr-3">
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full">Academy</button>
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full">Tutorials</button>
                <button className="text-right px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full">Meeting</button>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm w-full mt-auto">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">

          {/* Main Grid - Chart (2 cols) + My List (1 col) */}
          <div className="grid grid-cols-3 gap-6 mb-6">

            {/* Chart Section - 2 columns */}
            <div className="col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white text-base">شارت قافة</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تحليل هيكل السوق</p>
                </div>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                  {['نطاق قريب', 'متوسط', 'بعيد'].map((period) => (
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

              {/* Chart area with watermark */}
              <div className="relative h-52 rounded-xl bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <QafahWatermark className="text-slate-800 dark:text-white" />
                </div>

                {/* Y-axis */}
                <div className="absolute right-2 top-0 h-full flex flex-col justify-between py-2 text-xs text-slate-400">
                  <span>8,500</span>
                  <span>8,000</span>
                  <span>7,500</span>
                  <span>7,000</span>
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-2 pr-10">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="border-t border-slate-200 dark:border-slate-700 w-full" />
                  ))}
                </div>

                {/* SVG Chart line */}
                <svg className="absolute inset-0 w-full h-full pr-10" preserveAspectRatio="none" viewBox="0 0 300 200">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,160 C30,150 60,130 90,120 C120,110 150,140 180,100 C210,60 240,80 270,50 L270,200 L0,200 Z"
                    fill="url(#chartGrad)"
                  />
                  <path
                    d="M0,160 C30,150 60,130 90,120 C120,110 150,140 180,100 C210,60 240,80 270,50"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Last 6 Days */}
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

            {/* My List - 1 column */}
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
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">
                        {company.logo}
                      </div>
                      <span className="text-xs text-slate-300 dark:text-slate-600 w-4 text-center">{company.index}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid - 3 Cards */}
          <div className="grid grid-cols-3 gap-6">

            {/* Earnings */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">4 شركة</span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">إعلانات الأرباح</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right mb-3">الشركات ذات الإعلانات</p>
              <div className="flex flex-col gap-3">
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
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">
                        {company.logo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-xs text-blue-500 hover:text-blue-600 w-full text-left font-medium">المزيد ←</button>
            </div>

            {/* Dividends */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">4 شركة</span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">التوزيعات النقدية</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right mb-3">الشركات ذات التوزيعات</p>
              <div className="flex flex-col gap-3">
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
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg">
                        {company.logo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-xs text-blue-500 hover:text-blue-600 w-full text-left font-medium">المزيد ←</button>
            </div>

            {/* Alerts */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">12 جديد</span>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">التنبيهات والإشارات</h3>
              </div>
              <div className="flex flex-col gap-3 mt-3">
                {displayedAlerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div key={alert.id} className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <Icon className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-slate-400">{alert.time}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{alert.symbol}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="mt-4 text-xs text-blue-500 hover:text-blue-600 w-full text-left font-medium">المزيد ←</button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}