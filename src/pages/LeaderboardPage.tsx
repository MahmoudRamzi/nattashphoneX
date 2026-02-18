import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Bell,
  Menu,
  X,
  BarChart3,
  Moon,
  Sun,
  Search,
  Copy,
  Eye,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

// بيانات الموظفين/المحللين
const topPerformers = [
  {
    id: 1,
    name: 'أحمد محمد',
    role: 'محلل مالي أول',
    avatar: 'أم',
    portfolioValue: 125000,
    totalPnl: 18450,
    pnlPercent: 17.3,
    followers: 234,
    winRate: 78,
    tradesCount: 45,
    isFollowing: true,
    rank: 1,
    recentTrades: [
      { symbol: 'AAPL', type: 'buy', quantity: 50, price: 185.50, date: '2024-02-08' },
      { symbol: 'NVDA', type: 'buy', quantity: 30, price: 875.20, date: '2024-02-07' },
    ],
  },
  {
    id: 2,
    name: 'سارة خالد',
    role: 'محللة تقنية',
    avatar: 'سخ',
    portfolioValue: 98000,
    totalPnl: 15200,
    pnlPercent: 18.4,
    followers: 189,
    winRate: 82,
    tradesCount: 38,
    isFollowing: false,
    rank: 2,
    recentTrades: [
      { symbol: 'TSLA', type: 'sell', quantity: 25, price: 248.90, date: '2024-02-08' },
      { symbol: 'MSFT', type: 'buy', quantity: 40, price: 418.75, date: '2024-02-06' },
    ],
  },
  {
    id: 3,
    name: 'محمد عبدالله',
    role: 'خبير استراتيجيات',
    avatar: 'م ع',
    portfolioValue: 156000,
    totalPnl: 22100,
    pnlPercent: 16.5,
    followers: 312,
    winRate: 75,
    tradesCount: 52,
    isFollowing: false,
    rank: 3,
    recentTrades: [
      { symbol: 'GOOGL', type: 'buy', quantity: 20, price: 142.30, date: '2024-02-08' },
      { symbol: 'AMZN', type: 'buy', quantity: 35, price: 178.20, date: '2024-02-07' },
    ],
  },
  {
    id: 4,
    name: 'نورة الفهد',
    role: 'محللة سوق',
    avatar: 'نف',
    portfolioValue: 87000,
    totalPnl: 12400,
    pnlPercent: 16.8,
    followers: 156,
    winRate: 71,
    tradesCount: 34,
    isFollowing: false,
    rank: 4,
    recentTrades: [
      { symbol: 'META', type: 'buy', quantity: 15, price: 485.60, date: '2024-02-08' },
    ],
  },
  {
    id: 5,
    name: 'خالد سعيد',
    role: 'محلل أسهم',
    avatar: 'كس',
    portfolioValue: 112000,
    totalPnl: 16800,
    pnlPercent: 17.6,
    followers: 201,
    winRate: 79,
    tradesCount: 41,
    isFollowing: false,
    rank: 5,
    recentTrades: [
      { symbol: 'NVDA', type: 'buy', quantity: 25, price: 875.20, date: '2024-02-08' },
    ],
  },
];

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard';

interface LeaderboardPageProps {
  navigate: (page: Page) => void;
}

export function LeaderboardPage({ navigate }: LeaderboardPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setSelectedEmployee] = useState<typeof topPerformers[0] | null>(null);

  const filteredPerformers = topPerformers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-lg">1</div>;
    if (rank === 2) return <div className="w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-lg">2</div>;
    if (rank === 3) return <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-lg">3</div>;
    return <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold">{rank}</div>;
  };

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

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('dashboard')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">الأسواق</button>
              <button onClick={() => navigate('alerts')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">التنبيهات</button>
              <button onClick={() => navigate('leaderboard')} className="text-sm text-purple-600 dark:text-purple-400 font-medium">المحللون</button>
              <button onClick={() => navigate('education')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">التعليم</button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                م
              </div>
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
              <button onClick={() => navigate('dashboard')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                <BarChart3 className="w-5 h-5" />
                <span>الأسواق</span>
              </button>
              <button onClick={() => navigate('alerts')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                <Bell className="w-5 h-5" />
                <span>التنبيهات</span>
              </button>
              <button onClick={() => navigate('leaderboard')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                <Trophy className="w-5 h-5" />
                <span>المحللون</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">أفضل المحللين</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">تابع أفضل المحللين وانسخ صفقاتهم</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="البحث عن محلل..." 
                className="pr-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">156</p>
              <p className="text-sm text-slate-500 mt-1">محلل نشط</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">$2.4M</p>
              <p className="text-sm text-slate-500 mt-1">إجمالي الأرباح</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">12,450</p>
              <p className="text-sm text-slate-500 mt-1">متابع نشط</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">78%</p>
              <p className="text-sm text-slate-500 mt-1">متوسط نسبة النجاح</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {filteredPerformers.map((performer) => (
            <Card key={performer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Rank & Basic Info */}
                  <div className="flex items-center gap-4 p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-700">
                    {getRankBadge(performer.rank)}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {performer.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{performer.name}</h3>
                        <p className="text-sm text-slate-500">{performer.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-500">{performer.followers} متابع</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="flex items-center justify-around p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">+{performer.pnlPercent}%</p>
                      <p className="text-sm text-slate-500">العائد</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">${performer.totalPnl.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">الربح</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{performer.winRate}%</p>
                      <p className="text-sm text-slate-500">نسبة النجاح</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3 p-6 lg:w-1/3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setSelectedEmployee(performer)}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          عرض المحفظة
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                              {performer.avatar}
                            </div>
                            <div>
                              <p className="text-xl">{performer.name}</p>
                              <p className="text-sm text-slate-500 font-normal">{performer.role}</p>
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                              <p className="text-2xl font-bold text-green-600">+{performer.pnlPercent}%</p>
                              <p className="text-sm text-slate-500">العائد</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">${performer.totalPnl.toLocaleString()}</p>
                              <p className="text-sm text-slate-500">الربح الكلي</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                              <p className="text-2xl font-bold text-purple-600">{performer.winRate}%</p>
                              <p className="text-sm text-slate-500">نسبة النجاح</p>
                            </div>
                          </div>

                          {/* Recent Trades */}
                          <div>
                            <h4 className="font-bold mb-3">آخر الصفقات</h4>
                            <div className="space-y-2">
                              {performer.recentTrades.map((trade, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                  <div className="flex items-center gap-3">
                                    {getTradeBadge(trade.type)}
                                    <span className="font-bold">{trade.symbol}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-500">{trade.quantity} سهم</span>
                                    <span className="text-sm text-slate-500">@${trade.price}</span>
                                    <span className="text-sm text-slate-400">{trade.date}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Copy Button */}
                          <Button 
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => setShowCopyDialog(true)}
                          >
                            <Copy className="w-4 h-4 ml-2" />
                            نسخ جميع الصفقات
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      className={`flex-1 ${performer.isFollowing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                    >
                      {performer.isFollowing ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                          متابع
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 ml-2" />
                          متابعة
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-purple-600 text-white">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </main>

      {/* Copy Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>نسخ الصفقات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-slate-600 dark:text-slate-400">
              سيتم نسخ جميع الصفقات المفتوحة إلى محفظتك الشخصية. هل تريد المتابعة؟
            </p>
            <div className="flex gap-3">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setShowCopyDialog(false)}>
                <CheckCircle2 className="w-4 h-4 ml-2" />
                تأكيد النسخ
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowCopyDialog(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
