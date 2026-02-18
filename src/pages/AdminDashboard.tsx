import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  Edit,
  Trash2,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Settings,
  Bell,
  Briefcase
} from 'lucide-react';

interface AdminDashboardProps {
  navigate?: (page: string) => void;
}

const stats = [
  { name: 'إجمالي المستخدمين', value: '5,234', change: '+12%', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { name: 'المشتركين النشطين', value: '3,891', change: '+8%', icon: Package, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { name: 'الإشارات المرسلة', value: '45,678', change: '+23%', icon: TrendingUp, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { name: 'الإيرادات الشهرية', value: '125,000 ريال', change: '+15%', icon: DollarSign, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
];

const users = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', package: 'ذهبية', status: 'نشط', joinDate: '2024-01-15', expiryDate: '2024-07-15' },
  { id: 2, name: 'سارة خالد', email: 'sara@example.com', package: 'فضية', status: 'نشط', joinDate: '2024-02-01', expiryDate: '2024-08-01' },
  { id: 3, name: 'محمد عبدالله', email: 'mohammed@example.com', package: 'بلاتينية', status: 'نشط', joinDate: '2023-12-10', expiryDate: '2024-12-10' },
  { id: 4, name: 'نورة الفهد', email: 'noura@example.com', package: 'مجانية', status: 'نشط', joinDate: '2024-03-05', expiryDate: '-' },
  { id: 5, name: 'خالد سعيد', email: 'khaled@example.com', package: 'ذهبية', status: 'منتهي', joinDate: '2023-10-20', expiryDate: '2024-04-20' },
];

const recentAdjustments = [
  { id: 1, user: 'أحمد محمد', type: 'زيادة شركات', oldValue: '5', newValue: '8', reason: 'تعويض عن خلل فني', admin: 'عبدالله', date: '2024-03-15 14:30' },
  { id: 2, user: 'سارة خالد', type: 'تمديد اشتراك', oldValue: '2024-03-30', newValue: '2024-06-30', reason: 'عرض ولاء', admin: 'نورا', date: '2024-03-14 10:15' },
  { id: 3, user: 'محمد عبدالله', type: 'خصم سعري', oldValue: '300 ريال', newValue: '240 ريال', reason: 'عرض ترويجي', admin: 'أحمد', date: '2024-03-13 16:45' },
];

const packageDistribution = [
  { name: 'مجانية', count: 1343, percentage: 26 },
  { name: 'فضية', count: 1567, percentage: 30 },
  { name: 'ذهبية', count: 1456, percentage: 28 },
  { name: 'بلاتينية', count: 868, percentage: 16 },
];

export function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'نشط':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">نشط</Badge>;
      case 'منتهي':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">منتهي</Badge>;
      case 'معلق':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">معلق</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPackageBadge = (pkg: string) => {
    switch (pkg) {
      case 'بلاتينية':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">بلاتينية</Badge>;
      case 'ذهبية':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">ذهبية</Badge>;
      case 'فضية':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">فضية</Badge>;
      case 'مجانية':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">مجانية</Badge>;
      default:
        return <Badge variant="secondary">{pkg}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 z-40 h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="قافة" className="h-10 w-auto" />
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>نظرة عامة</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>المستخدمين</span>
            </button>
            <button
              onClick={() => navigate?.('admin-employees')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span>الموظفين</span>
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'packages'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>الباقات</span>
            </button>
            <button
              onClick={() => setActiveTab('adjustments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'adjustments'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>التعديلات</span>
            </button>
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all ${isSidebarOpen ? 'mr-64' : 'mr-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                لوحة التحكم
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                أد
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <Card key={stat.name}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.name}</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                          <p className="text-sm text-green-600 mt-1">{stat.change} من الشهر الماضي</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Package Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>توزيع الباقات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {packageDistribution.map((pkg) => (
                      <div key={pkg.name} className="flex items-center gap-4">
                        <span className="w-20 text-sm text-slate-600 dark:text-slate-400">{pkg.name}</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${pkg.percentage}%` }}
                          />
                        </div>
                        <span className="w-16 text-sm text-slate-900 dark:text-white text-left">{pkg.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input placeholder="البحث عن مستخدم..." className="pr-10" />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 ml-2" />
                    تصفية
                  </Button>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="w-4 h-4 ml-2" />
                  إضافة مستخدم
                </Button>
              </div>

              {/* Users Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المستخدم</TableHead>
                        <TableHead className="text-right">الباقة</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">تاريخ الاشتراك</TableHead>
                        <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getPackageBadge(user.package)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{user.joinDate}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{user.expiryDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <Edit className="w-4 h-4 text-slate-500" />
                              </button>
                              <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">عرض 1-5 من 5,234 مستخدم</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adjustments' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>سجل التعديلات</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المستخدم</TableHead>
                        <TableHead className="text-right">نوع التعديل</TableHead>
                        <TableHead className="text-right">القيمة القديمة</TableHead>
                        <TableHead className="text-right">القيمة الجديدة</TableHead>
                        <TableHead className="text-right">السبب</TableHead>
                        <TableHead className="text-right">الأدمن</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAdjustments.map((adj) => (
                        <TableRow key={adj.id}>
                          <TableCell className="font-medium text-slate-900 dark:text-white">{adj.user}</TableCell>
                          <TableCell>{adj.type}</TableCell>
                          <TableCell className="text-slate-500">{adj.oldValue}</TableCell>
                          <TableCell className="text-green-600">{adj.newValue}</TableCell>
                          <TableCell>{adj.reason}</TableCell>
                          <TableCell>{adj.admin}</TableCell>
                          <TableCell className="text-slate-500">{adj.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
