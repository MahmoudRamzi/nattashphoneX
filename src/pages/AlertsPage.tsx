import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  Bell,
  Menu,
  X,
  BarChart3,
  PieChart,
  History,
  Activity,
  Moon,
  Sun,
  User,
  Plus,
  Minus,
  RotateCcw,
  DollarSign,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

// بيانات التنبيهات
const importantAlerts = [
  {
    id: 1,
    type: 'distribution',
    title: 'تنبيه تصريف جديد',
    description: 'AAPL: رصدنا بيع مؤسسي بقيمة $12M',
    action: 'قرار',
    urgent: true,
  },
  {
    id: 2,
    type: 'early_distribution',
    title: 'تنبيه تصريف مبكر مكتشف',
    description: 'محفظة Whale Alpha قامت ببيع 40% من مركزها في TSLA خلال الساعة الماضية',
    action: 'قرار',
    urgent: true,
  },
];

const accumulationAlert = {
  id: 3,
  type: 'accumulation',
  title: 'تجميع جديد مكتشف',
  description: 'GOOGL: شراء مؤسسي كبير بقيمة $18M',
  action: 'قرار',
};

// بيانات عقود Options
const optionsContracts = [
  {
    id: 1,
    symbol: 'MSFT',
    name: 'Microsoft',
    signal: 'neutral',
    signalAr: 'محايد',
    strike: 415,
    contracts: 17,
    premium: 10,
    entryPrice: 15.20,
    pnl: 420,
    pnlPercent: 2.8,
    activityLevel: 45,
    activityText: 'تذبذب في النشاط - مراقبة مستمرة',
    color: 'yellow',
  },
  {
    id: 2,
    symbol: 'AAPL',
    name: 'Apple',
    signal: 'distribution',
    signalAr: 'تصريف',
    strike: 195,
    contracts: 17,
    premium: 20,
    entryPrice: 8.30,
    pnl: -1840,
    pnlPercent: -11.1,
    activityLevel: 75,
    activityText: 'بيع مؤسسي مكثف (4 صفقات كبيرة) ⚠️',
    color: 'red',
  },
  {
    id: 3,
    symbol: 'NVDA',
    name: 'NVIDIA',
    signal: 'accumulation',
    signalAr: 'تجميع',
    strike: 875,
    contracts: 20,
    premium: 15,
    entryPrice: 12.50,
    pnl: 3240,
    pnlPercent: 17.2,
    activityLevel: 85,
    activityText: 'شراء مؤسسي متصاعد (+240% عن المتوسط)',
    color: 'green',
  },
];

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin' | 'dashboard' | 'alerts';

interface AlertsPageProps {
  navigate: (page: Page) => void;
}

export function AlertsPage({ navigate }: AlertsPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const getSignalBadge = (signal: string, color: string) => {
    const styles = {
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
      red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
      green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    };
    
    return (
      <Badge className={`${styles[color as keyof typeof styles]} px-4 py-1.5 text-sm font-medium border`}>
        <span className={`w-2 h-2 rounded-full ml-2 ${color === 'yellow' ? 'bg-yellow-500' : color === 'red' ? 'bg-red-500' : 'bg-green-500'}`} />
        {signal}
      </Badge>
    );
  };

  const getActivityBarColor = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-purple-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2">
                <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </button>
              
              {/* Logo */}
              <button onClick={() => navigate('home')}>
                <img src="/logo.png" alt="قافة" className="h-10 w-auto" />
              </button>

              {/* Wallet Balance */}
              <div className="hidden md:flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl">
                <span className="text-sm">رصيد المحفظة</span>
                <span className="font-bold">$124,532.80</span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('education')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">التعليم</button>
              <button onClick={() => navigate('pricing')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">التقارير</button>
              <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">السجل</button>
              <button onClick={() => navigate('dashboard')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">الفرص</button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <button className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm">
                <User className="w-4 h-4" />
                <span>محفظتي</span>
              </button>
              
              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5 text-slate-600" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-slate-900 dark:text-white">القائمة</span>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <nav className="space-y-4">
              <button onClick={() => navigate('dashboard')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                <BarChart3 className="w-5 h-5" />
                <span>الفرص</span>
              </button>
              <button onClick={() => navigate('alerts')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                <Bell className="w-5 h-5" />
                <span>التنبيهات</span>
              </button>
              <button onClick={() => navigate('pricing')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                <PieChart className="w-5 h-5" />
                <span>التقارير</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                <History className="w-5 h-5" />
                <span>السجل</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important Alerts Section */}
        <div className="space-y-4 mb-8">
          {/* Distribution Alerts */}
          {importantAlerts.map((alert) => (
            <Card key={alert.id} className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-6">
                      {alert.action}
                    </Button>
                    <div>
                      <h3 className="font-bold text-yellow-800 dark:text-yellow-400 text-lg">{alert.title}</h3>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">{alert.description}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Accumulation Alert */}
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6">
                    {accumulationAlert.action}
                  </Button>
                  <div>
                    <h3 className="font-bold text-green-800 dark:text-green-400 text-lg">{accumulationAlert.title}</h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">{accumulationAlert.description}</p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Options Contracts Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-right">
            عقود Options النشطة <span className="text-purple-600">(6)</span>
          </h2>
        </div>

        {/* Options Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {optionsContracts.map((contract) => (
            <Card key={contract.id} className={`overflow-hidden border-2 ${
              contract.color === 'yellow' ? 'border-yellow-400 dark:border-yellow-600' :
              contract.color === 'red' ? 'border-red-400 dark:border-red-600' :
              'border-green-400 dark:border-green-600'
            }`}>
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    {getSignalBadge(contract.signalAr, contract.color)}
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{contract.symbol}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{contract.name}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                        contract.color === 'yellow' ? 'bg-yellow-500' :
                        contract.color === 'red' ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {contract.symbol.slice(0, 2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-slate-600 dark:text-slate-400">
                    بلو Call ${contract.strike} | {contract.contracts}
                  </div>
                </div>

                {/* Contract Details */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">الكمية</p>
                      <p className="font-bold text-slate-900 dark:text-white">{contract.premium} عقد</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">سعر الدخول</p>
                      <p className="font-bold text-slate-900 dark:text-white">${contract.entryPrice}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">الربح/الخسارة</p>
                      <p className={`font-bold ${contract.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ({contract.pnlPercent >= 0 ? '+' : ''}{contract.pnlPercent}%) {contract.pnl >= 0 ? '+' : ''}${Math.abs(contract.pnl).toLocaleString()}{contract.pnl < 0 ? '-' : '+'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">سعر الدخول</p>
                      <p className="font-bold text-slate-900 dark:text-white">${contract.entryPrice}</p>
                    </div>
                  </div>

                  {/* Activity Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">نشاط كبار الملاك اليوم</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getActivityBarColor(contract.color)}`}
                        style={{ width: `${contract.activityLevel}%` }}
                      />
                    </div>
                  </div>

                  {/* Activity Text */}
                  <div className={`p-3 rounded-lg mb-4 text-right text-sm ${
                    contract.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                    contract.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                    'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  }`}>
                    {contract.activityText}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button className={`${
                      contract.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
                      contract.color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                      'bg-green-500 hover:bg-green-600'
                    } text-white rounded-xl`}>
                      <Plus className="w-4 h-4 ml-2" />
                      زيادة
                    </Button>
                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl">
                      <Minus className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl">
                      <RotateCcw className="w-4 h-4 ml-2" />
                      تحويل
                    </Button>
                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl">
                      <DollarSign className="w-4 h-4 ml-2" />
                      بيع
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
