import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRightLeft,
  ShoppingCart,
  RotateCcw,
  Plus,
  BarChart3,
  Calendar,
  Activity,
  ArrowUpDown
} from 'lucide-react';

// بيانات الشركات
interface CompanyData {
  ticker: string;
  name: string;
  logo: string;
  signal: 'accumulation' | 'distribution';
  signalText: string;
  level: string;
  volume: string;
  volumeType: 'high' | 'normal';
  dailyDirection: number;
  loadDiff1d: number;
  hittingDays: number;
  perf5d: number;
  perf10d: number;
  sector: string;
  category: 'continuous' | 'sub' | 'change';
}

const companiesData: CompanyData[] = [
  // استمراري (Continuous - Re-accumulation)
  { ticker: 'AAPL', name: 'Apple', logo: '🍎', signal: 'accumulation', signalText: 'تجميع', level: 'MAJOR', volume: '45.2M', volumeType: 'high', dailyDirection: -1, loadDiff1d: -1.92, hittingDays: 3, perf5d: 2.29, perf10d: 9.15, sector: 'تكنولوجيا', category: 'continuous' },
  { ticker: 'NVDA', name: 'NVIDIA', logo: '🎮', signal: 'accumulation', signalText: 'تجميع', level: 'MAJOR', volume: '312.5M', volumeType: 'high', dailyDirection: -1, loadDiff1d: -3.21, hittingDays: 3, perf5d: 15.68, perf10d: 22.46, sector: 'تكنولوجيا', category: 'continuous' },
  { ticker: 'MSFT', name: 'Microsoft', logo: '💻', signal: 'accumulation', signalText: 'تجميع', level: 'MAJOR', volume: '22.1M', volumeType: 'normal', dailyDirection: 1, loadDiff1d: 0.88, hittingDays: 3, perf5d: 3.45, perf10d: 8.23, sector: 'تكنولوجيا', category: 'continuous' },
  
  // فرعي (Sub-direction)
  { ticker: 'META', name: 'Meta', logo: '👥', signal: 'distribution', signalText: 'تصريف', level: 'MAJOR', volume: '18.3M', volumeType: 'normal', dailyDirection: 1, loadDiff1d: 1.60, hittingDays: 2, perf5d: -1.82, perf10d: 3.20, sector: 'تكنولوجيا', category: 'sub' },
  { ticker: 'AMD', name: 'AMD', logo: '🔷', signal: 'distribution', signalText: 'تصريف', level: 'MAJOR', volume: '65.8M', volumeType: 'high', dailyDirection: 1, loadDiff1d: 2.84, hittingDays: 3, perf5d: -10.54, perf10d: -12.11, sector: 'تكنولوجيا', category: 'sub' },
  { ticker: 'DASH', name: 'DoorDash', logo: '🚗', signal: 'distribution', signalText: 'تصريف', level: 'MAJOR', volume: '8.5M', volumeType: 'normal', dailyDirection: 1, loadDiff1d: 1.29, hittingDays: 2, perf5d: -7.55, perf10d: -7.89, sector: 'خدمات', category: 'sub' },
  
  // تغيير اتجاه (Direction Change)
  { ticker: 'AMGN', name: 'Amgen', logo: '💊', signal: 'accumulation', signalText: 'تجميع', level: 'MAJOR', volume: '4.2M', volumeType: 'normal', dailyDirection: -1, loadDiff1d: -2.96, hittingDays: 2, perf5d: 11.31, perf10d: 9.70, sector: 'صحة', category: 'change' },
  { ticker: 'INTC', name: 'Intel', logo: '🔌', signal: 'accumulation', signalText: 'تجميع', level: 'MAJOR', volume: '52.3M', volumeType: 'high', dailyDirection: -1, loadDiff1d: -1.45, hittingDays: 2, perf5d: 2.29, perf10d: 17.28, sector: 'تكنولوجيا', category: 'change' },
  { ticker: 'ARM', name: 'ARM', logo: '💪', signal: 'accumulation', signalText: 'تجميع', level: 'MEDIUM', volume: '28.7M', volumeType: 'normal', dailyDirection: -1, loadDiff1d: -0.03, hittingDays: 2, perf5d: 19.52, perf10d: 11.09, sector: 'تكنولوجيا', category: 'change' },
];

// بيانات تاريخية للجدول
const historyData = [
  { date: '2026-02-09', direction: -1, loadDiff: -1.92, level: 'MAJOR', hittingDays: 3, perf5d: 2.29, perf10d: 9.15 },
  { date: '2026-02-08', direction: 1, loadDiff: 0.45, level: 'MEDIUM', hittingDays: 2, perf5d: 3.12, perf10d: 8.92 },
  { date: '2026-02-07', direction: -1, loadDiff: -0.82, level: 'LOW', hittingDays: 3, perf5d: 2.85, perf10d: 8.45 },
  { date: '2026-02-06', direction: 1, loadDiff: 1.25, level: 'HIGH', hittingDays: 2, perf5d: 3.45, perf10d: 7.89 },
  { date: '2026-02-05', direction: 1, loadDiff: 0.68, level: 'MEDIUM', hittingDays: 1, perf5d: 2.92, perf10d: 7.12 },
  { date: '2026-02-04', direction: -1, loadDiff: -1.45, level: 'MAJOR', hittingDays: 2, perf5d: 2.15, perf10d: 6.78 },
];

// بيانات صانع السوق
const marketMakerData = {
  bidVolume: '28.5M',
  askVolume: '16.7M',
  netFlow: '+11.8M',
  imbalance: 'شراء',
  darkPool: 'مرتفع',
  institutional: 'شراء قوي'
};

export function CompaniesAccumulationPage() {
  const [selectedCategory, setSelectedCategory] = useState<'continuous' | 'sub' | 'change'>('continuous');
  const [selectedCompany, setSelectedCompany] = useState<CompanyData>(companiesData[0]);

  const filteredCompanies = companiesData.filter(c => c.category === selectedCategory);

  const getSignalBadge = (signal: string) => {
    if (signal === 'accumulation') {
      return <Badge className="bg-green-500 text-white border-0"><TrendingUp className="w-3 h-3 ml-1" />تجميع</Badge>;
    }
    return <Badge className="bg-red-500 text-white border-0"><TrendingDown className="w-3 h-3 ml-1" />تصريف</Badge>;
  };

  const getVolumeBadge = (volumeType: string) => {
    if (volumeType === 'high') {
      return <Badge className="bg-purple-100 text-purple-700 text-xs">عالي</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-600 text-xs">طبيعي</Badge>;
  };

  const getDirectionIcon = (direction: number) => {
    if (direction > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <ArrowRightLeft className="w-5 h-5 text-slate-600" />
              </button>
              <img src="/logo.png" alt="قافة" className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-slate-500">فاحص السوق</span>
              <span className="text-sm text-slate-500">تاريخ التحديث: 09 فبراير</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedCategory === 'continuous' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('continuous')}
            className={selectedCategory === 'continuous' ? 'bg-purple-600' : ''}
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            استمراري
            <Badge className="mr-2 bg-white/20">{companiesData.filter(c => c.category === 'continuous').length}</Badge>
          </Button>
          <Button
            variant={selectedCategory === 'sub' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('sub')}
            className={selectedCategory === 'sub' ? 'bg-blue-600' : ''}
          >
            <Activity className="w-4 h-4 ml-2" />
            فرعي
            <Badge className="mr-2 bg-white/20">{companiesData.filter(c => c.category === 'sub').length}</Badge>
          </Button>
          <Button
            variant={selectedCategory === 'change' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('change')}
            className={selectedCategory === 'change' ? 'bg-orange-600' : ''}
          >
            <ArrowUpDown className="w-4 h-4 ml-2" />
            تغيير اتجاه
            <Badge className="mr-2 bg-white/20">{companiesData.filter(c => c.category === 'change').length}</Badge>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Side - Chart & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Card */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                      {selectedCompany.logo}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedCompany.ticker} - {selectedCompany.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        {getSignalBadge(selectedCompany.signal)}
                        <Badge className="bg-slate-100 text-slate-600">{selectedCompany.level}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">$228.45</p>
                    <p className={`text-sm ${selectedCompany.dailyDirection > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedCompany.dailyDirection > 0 ? '+' : ''}{selectedCompany.loadDiff1d.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400">شارت التجميع والتصريف</p>
                  </div>
                </div>

                {/* Market Maker Data */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">حجم الشراء</p>
                    <p className="font-bold text-green-600">{marketMakerData.bidVolume}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">حجم البيع</p>
                    <p className="font-bold text-red-600">{marketMakerData.askVolume}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">التدفق الصافي</p>
                    <p className="font-bold text-purple-600">{marketMakerData.netFlow}</p>
                  </div>
                </div>

                {/* Employee Action Buttons */}
                <div className="grid grid-cols-4 gap-3">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <ShoppingCart className="w-4 h-4 ml-1" />
                    شراء
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <TrendingDown className="w-4 h-4 ml-1" />
                    بيع
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <RotateCcw className="w-4 h-4 ml-1" />
                    إعادة شراء
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 ml-1" />
                    تغيير العقد
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* History Table */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  جدول الكميات السابقة
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-right py-2 px-3 text-sm font-medium text-slate-700">التاريخ</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-slate-700">الاتجاه</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-slate-700">الحمل</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-slate-700">المستوى</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-slate-700">5 أيام</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-slate-700">10 أيام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyData.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-sm text-slate-700">{row.date}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                              {getDirectionIcon(row.direction)}
                              <span className={`text-sm ${row.direction > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {row.direction > 0 ? '+' : ''}{row.direction}
                              </span>
                            </div>
                          </td>
                          <td className={`py-2 px-3 text-sm ${row.loadDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {row.loadDiff >= 0 ? '+' : ''}{row.loadDiff.toFixed(2)}%
                          </td>
                          <td className="py-2 px-3">
                            <Badge className="bg-slate-100 text-slate-600 text-xs">{row.level}</Badge>
                          </td>
                          <td className={`py-2 px-3 text-sm ${row.perf5d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {row.perf5d >= 0 ? '+' : ''}{row.perf5d.toFixed(2)}%
                          </td>
                          <td className={`py-2 px-3 text-sm ${row.perf10d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {row.perf10d >= 0 ? '+' : ''}{row.perf10d.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Company List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 mb-4">قائمة الشركات</h3>
            {filteredCompanies.map((company) => (
              <Card 
                key={company.ticker}
                className={`border-2 cursor-pointer hover:shadow-lg transition-all ${
                  selectedCompany.ticker === company.ticker 
                    ? 'border-purple-500 bg-purple-50' 
                    : company.signal === 'accumulation' 
                      ? 'border-green-200 hover:border-green-300' 
                      : 'border-red-200 hover:border-red-300'
                }`}
                onClick={() => setSelectedCompany(company)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                      {company.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{company.ticker}</p>
                        {getSignalBadge(company.signal)}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{company.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-slate-100 text-slate-600 text-xs">{company.level}</Badge>
                        {getVolumeBadge(company.volumeType)}
                        <span className="text-xs text-slate-400">{company.volume}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
