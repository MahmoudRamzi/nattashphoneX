import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bell,
  Menu,
  BarChart3,
  PieChart,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Users,
  Building2,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';

// أنواع المؤشرات
const indices = [
  { id: 'sp500', name: 'S&P 500', region: 'الولايات المتحدة' },
  { id: 'nasdaq', name: 'NASDAQ', region: 'الولايات المتحدة' },
  { id: 'dowjones', name: 'Dow Jones', region: 'الولايات المتحدة' },
  { id: 'tasi', name: 'TASI', region: 'السعودية' },
  { id: 'dfm', name: 'DFM', region: 'الإمارات' },
  { id: 'adx', name: 'ADX', region: 'الإمارات' },
];

// القطاعات
const sectors = [
  { id: 'tech', name: 'التكنولوجيا', icon: '💻' },
  { id: 'finance', name: 'المالية', icon: '🏦' },
  { id: 'healthcare', name: 'الرعاية الصحية', icon: '🏥' },
  { id: 'energy', name: 'الطاقة', icon: '⚡' },
  { id: 'consumer', name: 'السلع الاستهلاكية', icon: '🛒' },
  { id: 'industrial', name: 'الصناعة', icon: '🏭' },
  { id: 'realestate', name: 'العقارات', icon: '🏢' },
  { id: 'materials', name: 'المواد', icon: '⛏️' },
];

// الأسواق
const markets = [
  { id: 'us', name: 'الولايات المتحدة', currency: 'USD' },
  { id: 'sa', name: 'السعودية', currency: 'SAR' },
  { id: 'uae', name: 'الإمارات', currency: 'AED' },
  { id: 'uk', name: 'المملكة المتحدة', currency: 'GBP' },
];

// بيانات المحفظة الشخصية للموظف
const employeePortfolio = {
  name: 'محفظة أحمد الاستثمارية',
  description: 'محفظة متنوعة تركز على التكنولوجيا والطاقة',
  totalValue: 125000,
  totalPnl: 18450,
  pnlPercent: 17.3,
  followers: 234,
  isPublic: true,
  trades: [
    { id: 1, symbol: 'AAPL', name: 'Apple', type: 'buy', quantity: 50, price: 185.50, date: '2024-02-08', pnl: 2450 },
    { id: 2, symbol: 'NVDA', name: 'NVIDIA', type: 'buy', quantity: 30, price: 875.20, date: '2024-02-07', pnl: 8900 },
    { id: 3, symbol: 'TSLA', name: 'Tesla', type: 'sell', quantity: 25, price: 248.90, date: '2024-02-06', pnl: -1200 },
    { id: 4, symbol: 'MSFT', name: 'Microsoft', type: 'buy', quantity: 40, price: 418.75, date: '2024-02-05', pnl: 3200 },
    { id: 5, symbol: 'ARAMCO', name: 'Saudi Aramco', type: 'buy', quantity: 100, price: 32.45, date: '2024-02-04', pnl: 5100 },
  ],
};

// المشتركين المتابعين
const followers = [
  { id: 1, name: 'محمد علي', email: 'mohammed@example.com', joinDate: '2024-01-15', copiedTrades: 12, pnl: 3450 },
  { id: 2, name: 'سارة أحمد', email: 'sara@example.com', joinDate: '2024-01-20', copiedTrades: 8, pnl: 2100 },
  { id: 3, name: 'خالد سعيد', email: 'khaled@example.com', joinDate: '2024-02-01', copiedTrades: 5, pnl: 890 },
];

// إعدادات المؤشر المخصص
const customIndex = {
  name: 'مؤشر أحمد التقني',
  components: [
    { symbol: 'AAPL', weight: 25 },
    { symbol: 'MSFT', weight: 25 },
    { symbol: 'NVDA', weight: 20 },
    { symbol: 'GOOGL', weight: 15 },
    { symbol: 'META', weight: 15 },
  ],
  performance: 23.5,
};

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin' | 'dashboard' | 'alerts' | 'employee';

interface EmployeeDashboardProps {
  navigate: (page: Page) => void;
}

export function EmployeeDashboard({ navigate }: EmployeeDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isPublic, setIsPublic] = useState(employeePortfolio.isPublic);
  const [showNewTradeDialog, setShowNewTradeDialog] = useState(false);

  const getTradeBadge = (type: string) => {
    if (type === 'buy') {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">شراء</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">بيع</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2">
                <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </button>
              <button onClick={() => navigate('home')}>
                <img src="/logo.png" alt="قافة" className="h-10 w-auto" />
              </button>
            </div>

            {/* Center - Employee Badge */}
            <div className="hidden md:flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-xl">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">لوحة الموظف</span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                أح
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-16 right-0 z-40 h-[calc(100vh-4rem)] transition-transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 lg:translate-x-0`}>
        <div className="h-full flex flex-col p-4">
          {/* Employee Info */}
          <div className="p-4 mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                أح
              </div>
              <div>
                <p className="font-bold">أحمد محمد</p>
                <p className="text-sm text-white/80">محلل مالي أول</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>المتابعين</span>
              <span className="font-bold">{employeePortfolio.followers}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span>محفظتي</span>
            </button>
            <button
              onClick={() => setActiveTab('index')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'index'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>المؤشر المخصص</span>
            </button>
            <button
              onClick={() => setActiveTab('sectors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'sectors'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>القطاعات</span>
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'markets'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>الأسواق</span>
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'followers'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>المتابعين</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>الإعدادات</span>
            </button>
          </nav>

          {/* Logout */}
          <button 
            onClick={() => navigate('login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 p-6">
        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Portfolio Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{employeePortfolio.name}</h1>
                <p className="text-slate-500 dark:text-slate-400">{employeePortfolio.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isPublic 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{isPublic ? 'عامة' : 'خاصة'}</span>
                </button>
                <Dialog open={showNewTradeDialog} onOpenChange={setShowNewTradeDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 ml-2" />
                      صفقة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>إضافة صفقة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>الرمز</Label>
                          <Input placeholder="مثال: AAPL" />
                        </div>
                        <div className="space-y-2">
                          <Label>النوع</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy">شراء</SelectItem>
                              <SelectItem value="sell">بيع</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>الكمية</Label>
                          <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>السعر</Label>
                          <Input type="number" placeholder="0.00" />
                        </div>
                      </div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowNewTradeDialog(false)}>
                        إضافة الصفقة
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Portfolio Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 mb-1">قيمة المحفظة</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${employeePortfolio.totalValue.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 mb-1">الربح/الخسارة</p>
                  <p className="text-2xl font-bold text-green-600">
                    +${employeePortfolio.totalPnl.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">+{employeePortfolio.pnlPercent}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 mb-1">المتابعين</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {employeePortfolio.followers}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 mb-1">عدد الصفقات</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {employeePortfolio.trades.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trades Table */}
            <Card>
              <CardHeader>
                <CardTitle>سجل الصفقات</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الرمز</TableHead>
                      <TableHead className="text-center">النوع</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">السعر</TableHead>
                      <TableHead className="text-center">التاريخ</TableHead>
                      <TableHead className="text-center">الربح/الخسارة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePortfolio.trades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>
                          <div>
                            <p className="font-bold">{trade.symbol}</p>
                            <p className="text-sm text-slate-500">{trade.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{getTradeBadge(trade.type)}</TableCell>
                        <TableCell className="text-center">{trade.quantity}</TableCell>
                        <TableCell className="text-center">${trade.price}</TableCell>
                        <TableCell className="text-center">{trade.date}</TableCell>
                        <TableCell className="text-center">
                          <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                              <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Custom Index Tab */}
        {activeTab === 'index' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">المؤشر المخصص</h1>
              <Button variant="outline">
                <Edit className="w-4 h-4 ml-2" />
                تعديل المؤشر
              </Button>
            </div>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold">{customIndex.name}</h2>
                    <p className="text-white/80 mt-1">مؤشر شخصي مخصص</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">+{customIndex.performance}%</p>
                    <p className="text-white/80">الأداء السنوي</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>مكونات المؤشر</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customIndex.components.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-bold text-purple-600">
                            {comp.symbol.slice(0, 2)}
                          </div>
                          <span className="font-medium">{comp.symbol}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${comp.weight}%` }} />
                          </div>
                          <span className="text-sm font-medium w-12">{comp.weight}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إنشاء مؤشر جديد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>اسم المؤشر</Label>
                    <Input placeholder="أدخل اسم المؤشر" />
                  </div>
                  <div className="space-y-2">
                    <Label>المؤشر الأساسي</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المؤشر" />
                      </SelectTrigger>
                      <SelectContent>
                        {indices.map((idx) => (
                          <SelectItem key={idx.id} value={idx.id}>{idx.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء المؤشر
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Sectors Tab */}
        {activeTab === 'sectors' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">القطاعات المتخصصة</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sectors.map((sector) => (
                <Card key={sector.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{sector.icon}</div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{sector.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">متابعة</Badge>
                      <Badge variant="outline" className="text-xs">تحليل</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>قطاعاتي المفضلة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-4 py-2">
                    💻 التكنولوجيا
                    <button className="mr-2 hover:text-red-500">×</button>
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-4 py-2">
                    ⚡ الطاقة
                    <button className="mr-2 hover:text-red-500">×</button>
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-4 py-2">
                    🏦 المالية
                    <button className="mr-2 hover:text-red-500">×</button>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">الأسواق العالمية</h1>

            <div className="grid md:grid-cols-2 gap-4">
              {markets.map((market) => (
                <Card key={market.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{market.name}</h3>
                        <p className="text-sm text-slate-500">العملة: {market.currency}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-slate-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">متابعة</Button>
                      <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">تحليل</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>أسواقي المفضلة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        🇺🇸
                      </div>
                      <div>
                        <p className="font-medium">الولايات المتحدة</p>
                        <p className="text-sm text-slate-500">USD</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">نشط</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        🇸🇦
                      </div>
                      <div>
                        <p className="font-medium">السعودية</p>
                        <p className="text-sm text-slate-500">SAR</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">نشط</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === 'followers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">المتابعين</h1>
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-4 py-2">
                {employeePortfolio.followers} متابع
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>قائمة المتابعين</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المشترك</TableHead>
                      <TableHead className="text-center">تاريخ الاشتراك</TableHead>
                      <TableHead className="text-center">الصفقات المنسوخة</TableHead>
                      <TableHead className="text-center">ربحهم</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {followers.map((follower) => (
                      <TableRow key={follower.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {follower.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{follower.name}</p>
                              <p className="text-sm text-slate-500">{follower.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{follower.joinDate}</TableCell>
                        <TableCell className="text-center">{follower.copiedTrades}</TableCell>
                        <TableCell className="text-center text-green-600">
                          +${follower.pnl.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-700">نشط</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{employeePortfolio.followers}</p>
                  <p className="text-sm text-slate-500 mt-1">إجمالي المتابعين</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">$12,450</p>
                  <p className="text-sm text-slate-500 mt-1">إجمالي أرباح المتابعين</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">87%</p>
                  <p className="text-sm text-slate-500 mt-1">نسبة رضا المتابعين</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إعدادات المحفظة</h1>

            <Card>
              <CardHeader>
                <CardTitle>الخصوصية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div>
                    <p className="font-medium">جعل المحفظة عامة</p>
                    <p className="text-sm text-slate-500">السماح للمشتركين برؤية صفقاتك ونسخها</p>
                  </div>
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      isPublic ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الإشعارات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div>
                    <p className="font-medium">إشعارات الصفقات الجديدة</p>
                    <p className="text-sm text-slate-500">إرسال إشعار للمتابعين عند إضافة صفقة جديدة</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div>
                    <p className="font-medium">إشعارات الأرباح</p>
                    <p className="text-sm text-slate-500">إرسال إشعار عند تحقيق ربح كبير</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
