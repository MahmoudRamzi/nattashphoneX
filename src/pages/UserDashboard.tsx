import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Bell,
  Info,
  Moon,
  Sun,
  Activity,
  Star,
  DollarSign,
  Megaphone,
  Home,
  Phone,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Settings,
  PieChart
} from 'lucide-react';

// بيانات قائمتي (My List)
const myListCompanies = [
  { index: 1, symbol: 'AAPL', name: 'Apple', logo: '🍎', signal: 'accumulation', signalText: 'تجميع', change: 2.45 },
  { index: 2, symbol: 'NVDA', name: 'NVIDIA', logo: '🎮', signal: 'accumulation', signalText: 'تجميع', change: 3.21 },
  { index: 3, symbol: 'META', name: 'Meta', logo: '👥', signal: 'distribution', signalText: 'تصريف', change: -1.23 },
  { index: 4, symbol: 'MSFT', name: 'Microsoft', logo: '💻', signal: 'accumulation', signalText: 'تجميع', change: 1.67 },
  { index: 5, symbol: 'AMD', name: 'AMD', logo: '🔷', signal: 'distribution', signalText: 'تصريف', change: -2.84 },
  { index: 6, symbol: 'AMZN', name: 'Amazon', logo: '📦', signal: 'accumulation', signalText: 'تجميع', change: 1.89 },
];

// بيانات الشركات ذات الإعلانات (للتجميع)
const earningsCompanies = [
  { ticker: 'ADBE', name: 'Adobe', logo: '🎨', change: 5.82, eps: '$4.38', time: 'بعد الإغلاق' },
  { ticker: 'CRM', name: 'Salesforce', logo: '☁️', change: 3.45, eps: '$2.78', time: 'بعد الإغلاق' },
];

// بيانات الشركات ذات التوزيعات النقدية
const dividendCompanies = [
  { ticker: 'AAPL', name: 'Apple', logo: '🍎', dividend: 0.26, exDate: '09 فبراير', yield: '0.52%' },
  { ticker: 'MSFT', name: 'Microsoft', logo: '💻', dividend: 0.83, exDate: '20 فبراير', yield: '0.72%' },
];

// بيانات آخر 6 أيام (للأسهم الصاعدة/الهابطة)
const last6Days = [
  { day: 'الجمعة', direction: 'down' },
  { day: 'الخميس', direction: 'down' },
  { day: 'الثلاثاء', direction: 'up' },
  { day: 'الأربعاء', direction: 'up' },
  { day: 'الإثنين', direction: 'up' },
  { day: 'الأحد', direction: 'up' },
];

// التنبيهات والإشارات
const alerts = [
  { id: 1, symbol: 'AAPL', time: '2m ago', message: 'Broke above resistance at 228.50', type: 'breakout', icon: TrendingUp },
  { id: 2, symbol: 'NVDA', time: '5m ago', message: 'Unusual volume detected (+340%)', type: 'volume', icon: Activity },
  { id: 3, symbol: 'META', time: '12m ago', message: 'Distribution pattern forming', type: 'pattern', icon: Star },
];

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin' | 'dashboard' | 'alerts';

interface UserDashboardProps {
  navigate: (page: Page) => void;
}

// مكون مثلث صاعد
const UpTriangle = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 5L4 19H20L12 5Z" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
  </svg>
);

// مكون مثلث هابط
const DownTriangle = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 19L4 5H20L12 19Z" fill="none" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
  </svg>
);

// مكون شعار قافة للشريط الجانبي - مثل الصفحة الأولى
const QafahLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sidebarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="50%" stopColor="#4c1d95" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    {/* المربعات العلوية */}
    <rect x="70" y="0" width="35" height="35" fill="url(#sidebarGradient)" rx="2"/>
    <rect x="115" y="0" width="35" height="50" fill="url(#sidebarGradient)" rx="2"/>
    {/* الحرف Q الرئيسي */}
    <path d="M0 60 H160 V160 H100 L140 200 L110 230 L70 190 V220 H0 V60 Z M40 95 V185 H120 V95 H40 Z" fill="url(#sidebarGradient)"/>
    {/* النص QAFAH */}
    <text x="100" y="225" textAnchor="middle" fill="#1e3a8a" fontSize="36" fontWeight="bold" fontFamily="Arial, sans-serif">QAFAH</text>
  </svg>
);

// مكون شعار قافة للعلامة المائية في الشارت
const QafahWatermark = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-28">
      <defs>
        <linearGradient id="watermarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      {/* المربعات العلوية */}
      <rect x="40" y="0" width="22" height="22" fill="url(#watermarkGrad)" rx="2"/>
      <rect x="68" y="0" width="22" height="30" fill="url(#watermarkGrad)" rx="2"/>
      {/* الحرف Q الرئيسي */}
      <path d="M0 35 H95 V95 H60 L85 120 L65 140 L40 115 V135 H0 V35 Z M25 55 V115 H70 V55 H25 Z" fill="url(#watermarkGrad)"/>
    </svg>
    <span className="text-2xl font-bold text-purple-400/40 mt-1">QAFAH</span>
  </div>
);

export function UserDashboard({}: UserDashboardProps) {
  const [activePeriod, setActivePeriod] = useState('نطاق قريب');
  const [isDark, setIsDark] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['portfolio', 'education']);
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
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />تجميع
          </span>
          <p className="text-xs mt-1 font-medium text-green-600 dark:text-green-400">+{change}%</p>
        </div>
      );
    }
    return (
      <div className="text-right">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">
          <TrendingDown className="w-3 h-3" />تصريف
        </span>
        <p className="text-xs mt-1 font-medium text-red-600 dark:text-red-400">{change}%</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir="rtl">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Icons */}
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Info className="w-5 h-5" />
              </button>
              <button className="relative w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
              </button>
            </div>

            {/* Center - Welcome */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">👋</span>
              <span className="text-xl font-bold text-slate-800 dark:text-white">
                أهلاً، <span className="text-purple-600 dark:text-purple-400">أحمد</span>
              </span>
            </div>

            {/* Right Side - Empty */}
            <div className="w-32"></div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Right Sidebar */}
        <aside className="hidden lg:block w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4">
            {/* Logo at top of sidebar - Like first page */}
            <div className="flex justify-center mb-6 py-2">
              <QafahLogo className="w-40 h-48" />
            </div>

            {/* Dashboard */}
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-medium mb-2">
              <span className="flex items-center gap-3">
                <Home className="w-5 h-5" />
                لوحة التحكم
              </span>
            </button>

            {/* Calls */}
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-2">
              <span className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                Calls
              </span>
            </button>

            {/* Portfolio - Expandable */}
            <div className="mb-2">
              <button 
                onClick={() => toggleMenu('portfolio')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <PieChart className="w-5 h-5" />
                  محفظتي
                </span>
                {expandedMenus.includes('portfolio') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedMenus.includes('portfolio') && (
                <div className="mr-8 mt-1 space-y-1">
                  <button className="w-full text-right px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    الأسواق
                  </button>
                  <button className="w-full text-right px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    فاحص السوق
                  </button>
                </div>
              )}
            </div>

            {/* Indicators Alerts */}
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-2">
              <span className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                Indicators Alerts
              </span>
            </button>

            {/* Education - Expandable */}
            <div className="mb-2">
              <button 
                onClick={() => toggleMenu('education')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5" />
                  التعليم
                </span>
                {expandedMenus.includes('education') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedMenus.includes('education') && (
                <div className="mr-8 mt-1 space-y-1">
                  <button className="w-full text-right px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Academy
                  </button>
                  <button className="w-full text-right px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Tutorials
                  </button>
                  <button className="w-full text-right px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Meeting
                  </button>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mt-4">
              <span className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                Settings
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Main Grid - Chart big (2 cols), My List small (1 col) */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart Section - Big (2 columns) */}
            <div className="lg:col-span-2">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full relative">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {['نطاق قريب', 'متوسط', 'بعيد'].map((period) => (
                        <button
                          key={period}
                          onClick={() => setActivePeriod(period)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            activePeriod === period
                              ? 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">شارت قافة</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">تحليل هيكل السوق</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 relative">
                  {/* Watermark Logo - Centered in chart */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <QafahWatermark />
                  </div>

                  {/* Chart */}
                  <div className="h-72 relative overflow-hidden mb-4 z-0">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400 py-4 pr-2">
                      <span>8,500</span>
                      <span>8,000</span>
                      <span>7,500</span>
                      <span>7,000</span>
                    </div>
                    {/* Chart area */}
                    <div className="ml-14 h-full relative">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
                        ))}
                      </div>
                      {/* Chart line */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        {/* Area fill */}
                        <path
                          d="M0,90 C5,88 10,85 15,82 C20,78 25,74 30,70 C35,66 40,62 45,58 C50,54 55,50 60,46 C65,42 70,38 75,34 C80,30 85,26 90,22 C95,18 100,15 100,15 L100,100 L0,100 Z"
                          fill="url(#chartGradient)"
                        />
                        {/* Line */}
                        <path
                          d="M0,90 C5,88 10,85 15,82 C20,78 25,74 30,70 C35,66 40,62 45,58 C50,54 55,50 60,46 C65,42 70,38 75,34 C80,30 85,26 90,22 C95,18 100,15 100,15"
                          fill="none"
                          stroke="#7c3aed"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Last 6 Days - With shadow like image */}
                  <div className="mt-6">
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300 mb-4 text-center">آخر 6 أيام</p>
                    <div className="flex justify-center gap-4">
                      {last6Days.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div 
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                              day.direction === 'up' 
                                ? 'bg-gradient-to-b from-green-400 to-green-500' 
                                : 'bg-gradient-to-b from-red-400 to-red-500'
                            }`}
                            style={{
                              boxShadow: day.direction === 'up' 
                                ? '0 8px 20px rgba(34, 197, 94, 0.4)' 
                                : '0 8px 20px rgba(239, 68, 68, 0.4)'
                            }}
                          >
                            {day.direction === 'up' ? <UpTriangle /> : <DownTriangle />}
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{day.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* My List - Small (1 column) */}
            <div>
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">قائمتي</h3>
                    <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      إدارة القائمة ←
                    </button>
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {myListCompanies.map((company) => (
                      <div key={company.symbol} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-400">{company.index}</span>
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                            {company.logo}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{company.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{company.symbol}</p>
                          </div>
                        </div>
                        {getSignalBadge(company.signal, company.change)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Grid - 3 Cards with More buttons */}
          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            {/* Earnings */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">4 شركة</span>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">إعلانات الأرباح</h3>
                      <Megaphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400">الشركات ذات الإعلانات</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {earningsCompanies.map((company) => (
                    <div key={company.ticker} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="text-left">
                        <p className={`text-sm font-medium ${company.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {company.change >= 0 ? '+' : ''}{company.change}%
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{company.time}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{company.ticker}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{company.name}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                          {company.logo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center">
                  <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    المزيد ←
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Dividends */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">4 شركة</span>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">التوزيعات النقدية</h3>
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">الشركات ذات التوزيعات</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {dividendCompanies.map((company) => (
                    <div key={company.ticker} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="text-left">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">${company.dividend}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{company.exDate}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{company.ticker}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{company.name}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl">
                          {company.logo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center">
                  <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    المزيد ←
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full font-medium">12 جديد</span>
                  <div className="text-right">
                    <h3 className="font-bold text-slate-900 dark:text-white">التنبيهات والإشارات</h3>
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {displayedAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{alert.time}</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded font-medium">{alert.symbol}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{alert.message}</p>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          alert.type === 'breakout' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          alert.type === 'volume' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          alert.type === 'pattern' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                        }`}>
                          <alert.icon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center">
                  <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    المزيد ←
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
