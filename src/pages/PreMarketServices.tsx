import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  ArrowRight,
  Gift,
  Activity,
  Info,
  AlertTriangle,
  User,
  RefreshCw,
  DollarSign,
  BarChart3,
  Megaphone
} from 'lucide-react';

// بيانات التوزيعات النقدية
const thisWeekDividends = [
  { ticker: 'AAPL', name: 'Apple', dividend: 0.26, exDate: '09 فبراير', logo: '🍎' },
  { ticker: 'IBM', name: 'IBM', dividend: 1.68, exDate: '10 فبراير', logo: '💻' },
  { ticker: 'ASML', name: 'ASML', dividend: 1.60, exDate: '10 فبراير', logo: '🔬' },
  { ticker: 'TGT', name: 'Target', dividend: 1.14, exDate: '11 فبراير', logo: '🎯' },
  { ticker: 'XOM', name: 'Exxon', dividend: 1.03, exDate: '12 فبراير', logo: '⛽' },
  { ticker: 'SBUX', name: 'Starbucks', dividend: 0.62, exDate: '13 فبراير', logo: '☕' },
  { ticker: 'AMGN', name: 'Amgen', dividend: 2.52, exDate: '13 فبراير', logo: '💊' },
  { ticker: 'LLY', name: 'Eli Lilly', dividend: 1.73, exDate: '13 فبراير', logo: '🔬' },
];

const nextWeekDividends = [
  { ticker: 'JNJ', name: 'Johnson', dividend: 1.24, exDate: '17 فبراير', logo: '💊' },
  { ticker: 'PG', name: 'P&G', dividend: 1.01, exDate: '18 فبراير', logo: '🧴' },
  { ticker: 'KO', name: 'Coca-Cola', dividend: 0.49, exDate: '19 فبراير', logo: '🥤' },
  { ticker: 'MSFT', name: 'Microsoft', dividend: 0.83, exDate: '20 فبراير', logo: '💻' },
  { ticker: 'V', name: 'Visa', dividend: 0.59, exDate: '20 فبراير', logo: '💳' },
];

// بيانات الشركات الأعلى حركة
const gainers = [
  { ticker: 'DDOG', name: 'Datadog', change: '+16.58', changePercent: '+10.92%', logo: '🐕' },
  { ticker: 'MMM', name: '3M', change: '+0.78', changePercent: '+0.44%', logo: '🏭' },
  { ticker: 'ADP', name: 'ADP', change: '+1.70', changePercent: '+0.60%', logo: '💼' },
  { ticker: 'CVX', name: 'Chevron', change: '+1.78', changePercent: '+1.13%', logo: '⛽' },
  { ticker: 'MPC', name: 'Marathon', change: '+1.00', changePercent: '+0.61%', logo: '🏃' },
  { ticker: 'PPG', name: 'PPG', change: '+0.71', changePercent: '+0.50%', logo: '🎨' },
];

const losers = [
  { ticker: 'KO', name: 'Coca-Cola', change: '-1.07', changePercent: '-1.68%', logo: '🥤' },
  { ticker: 'INTC', name: 'Intel', change: '-0.32', changePercent: '-1.44%', logo: '💻' },
  { ticker: 'WMT', name: 'Walmart', change: '-0.85', changePercent: '-1.12%', logo: '🛒' },
  { ticker: 'MSTR', name: 'MicroStrategy', change: '-12.45', changePercent: '-3.25%', logo: '₿' },
];

// بيانات الإعلانات
const earnings = [
  { ticker: 'ADBE', name: 'Adobe', date: '12 فبراير', time: 'بعد', eps: '$4.38', logo: '🎨' },
  { ticker: 'WDAY', name: 'Workday', date: '12 فبراير', time: 'بعد', eps: '$1.52', logo: '💼' },
  { ticker: 'CRM', name: 'Salesforce', date: '13 فبراير', time: 'بعد', eps: '$2.78', logo: '☁️' },
  { ticker: 'NOW', name: 'ServiceNow', date: '13 فبراير', time: 'بعد', eps: '$3.67', logo: '⚡' },
  { ticker: 'CSCO', name: 'Cisco', date: '14 فبراير', time: 'بعد', eps: '$0.92', logo: '🌐' },
  { ticker: 'APA', name: 'APA Corp', date: '14 فبراير', time: 'بعد', eps: '$0.85', logo: '🛢️' },
];

// ملاحظات الموظف
const employeeNotes = [
  {
    id: '1',
    title: 'تحديث صباحي',
    content: 'الأسواق الآجلة تظهر ارتفاعاً طفيفاً. ترقبوا تقارير الأرباح المهمة هذا الأسبوع.',
    time: '08:30 ص',
    author: 'أحمد العلي'
  },
  {
    id: '2',
    title: 'فرصة على DDOG',
    content: 'نتائج الشركة فاقت التوقعات بشكل كبير. التدفق المؤسسي إيجابي.',
    time: '08:15 ص',
    author: 'سارة محمد'
  },
];

interface PreMarketServicesProps {
  navigate?: (page: string) => void;
}

export function PreMarketServices({ navigate }: PreMarketServicesProps) {
  const [activeTab, setActiveTab] = useState<'dividends' | 'movers' | 'earnings'>('dividends');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate?.('dashboard')}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-slate-600" />
              </button>
              <img src="/logo.png" alt="قافة" className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                08:30 ص - 09 فبراير
              </span>
              <Button size="sm" variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Clock className="w-8 h-8 text-purple-600" />
            خدمات ما قبل التداول
          </h1>
          <p className="text-slate-500 mt-2">
            تحديثات يومية من فريقنا قبل بداية التداولات بساعة
          </p>
        </div>

        {/* Employee Notes */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            ملاحظات فريق الأسواق
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {employeeNotes.map((note) => (
              <Card key={note.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900">{note.title}</h3>
                    <span className="text-sm text-slate-400">{note.time}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-2">{note.content}</p>
                  <p className="text-xs text-slate-400">{note.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'dividends' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dividends')}
            className={activeTab === 'dividends' ? 'bg-purple-600' : ''}
          >
            <Gift className="w-4 h-4 ml-2" />
            التوزيعات
          </Button>
          <Button
            variant={activeTab === 'movers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('movers')}
            className={activeTab === 'movers' ? 'bg-purple-600' : ''}
          >
            <Activity className="w-4 h-4 ml-2" />
            الحركة قبل الافتتاح
          </Button>
          <Button
            variant={activeTab === 'earnings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('earnings')}
            className={activeTab === 'earnings' ? 'bg-purple-600' : ''}
          >
            <Megaphone className="w-4 h-4 ml-2" />
            إعلانات الأرباح
          </Button>
        </div>

        {/* Dividends Content */}
        {activeTab === 'dividends' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* This Week */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  هذا الأسبوع (09-13 فبراير)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {thisWeekDividends.map((stock) => (
                    <div key={stock.ticker} className="bg-slate-800 rounded-xl p-4 text-center hover:bg-slate-700 transition-colors border border-slate-700">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-600 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        {stock.logo}
                      </div>
                      <p className="font-bold text-white">{stock.ticker}</p>
                      <p className="text-xs text-slate-400 mb-2">{stock.exDate}</p>
                      <Badge className="bg-green-500 text-white border-0">
                        <DollarSign className="w-3 h-3 ml-1" />
                        {stock.dividend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Week */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  الأسبوع المقبل (16-20 فبراير)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {nextWeekDividends.map((stock) => (
                    <div key={stock.ticker} className="bg-slate-800 rounded-xl p-4 text-center hover:bg-slate-700 transition-colors border border-slate-700">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-600 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        {stock.logo}
                      </div>
                      <p className="font-bold text-white">{stock.ticker}</p>
                      <p className="text-xs text-slate-400 mb-2">{stock.exDate}</p>
                      <Badge className="bg-green-500 text-white border-0">
                        <DollarSign className="w-3 h-3 ml-1" />
                        {stock.dividend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <div className="lg:col-span-2">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">ملاحظة مهمة</p>
                      <p className="text-blue-700 text-sm">
                        التوزيعات النقدية يتم دفعها للمساهمين المسجلين قبل تاريخ الاستحقاق (Ex-Date).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Movers Content */}
        {activeTab === 'movers' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Gainers */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  الأعلى ارتفاعاً
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gainers.map((stock) => (
                    <div key={stock.ticker} className="bg-slate-800 rounded-xl p-4 text-center hover:bg-slate-700 transition-colors border border-slate-700">
                      <div className="w-12 h-12 mx-auto mb-3 bg-green-600 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        {stock.logo}
                      </div>
                      <p className="font-bold text-white">{stock.ticker}</p>
                      <p className="text-xs text-green-400 font-medium">{stock.changePercent}</p>
                      <Badge className="bg-green-500 text-white border-0 mt-2">
                        +{stock.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Losers */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  الأعلى انخفاضاً
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {losers.map((stock) => (
                    <div key={stock.ticker} className="bg-slate-800 rounded-xl p-4 text-center hover:bg-slate-700 transition-colors border border-slate-700">
                      <div className="w-12 h-12 mx-auto mb-3 bg-red-600 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        {stock.logo}
                      </div>
                      <p className="font-bold text-white">{stock.ticker}</p>
                      <p className="text-xs text-red-400 font-medium">{stock.changePercent}</p>
                      <Badge className="bg-red-500 text-white border-0 mt-2">
                        {stock.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earnings Content */}
        {activeTab === 'earnings' && (
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                إعلانات الأرباح القادمة
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {earnings.map((stock) => (
                  <div key={stock.ticker} className="bg-slate-800 rounded-xl p-4 text-center hover:bg-slate-700 transition-colors border border-slate-700">
                    <div className="w-12 h-12 mx-auto mb-3 bg-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                      {stock.logo}
                    </div>
                    <p className="font-bold text-white">{stock.ticker}</p>
                    <p className="text-xs text-slate-400">{stock.date}</p>
                    <Badge className="bg-orange-500 text-white border-0 mt-2">
                      {stock.time === 'before' ? 'قبل' : 'بعد'}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900">تنبيه</p>
                        <p className="text-orange-700 text-sm">
                          إعلانات الأرباح قد تسبب تقلبات حادة في السعر. تأكد من وضع أوامر وقف الخسارة.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
