import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Users, Search, Filter, Edit, Trash2, LogOut, Menu, X,
  ChevronLeft, ChevronRight, UserPlus, Settings, Bell, Shield,
  Briefcase, TrendingUp, Building2, Layers, Globe, PieChart,
  Activity, BarChart3, UserCheck, Eye, EyeOff, Save,
  CheckCircle2, XCircle, AlertTriangle, LayoutDashboard,
} from 'lucide-react';
import type { UserRole, User } from '@/types/permissions';
import { defaultPermissions } from '@/types/permissions';

const availableIndices = [
  { id: 'sp500', name: 'S&P 500', code: 'SPX' },
  { id: 'nasdaq', name: 'NASDAQ', code: 'IXIC' },
  { id: 'dowjones', name: 'Dow Jones', code: 'DJI' },
  { id: 'russell2000', name: 'Russell 2000', code: 'RUT' },
  { id: 'vix', name: 'VIX', code: 'VIX' },
];
const availableFunds = [
  { id: 'spy', name: 'SPDR S&P 500', ticker: 'SPY' },
  { id: 'qqq', name: 'Invesco QQQ', ticker: 'QQQ' },
  { id: 'dia', name: 'SPDR Dow Jones', ticker: 'DIA' },
  { id: 'iwm', name: 'iShares Russell 2000', ticker: 'IWM' },
  { id: 'voo', name: 'Vanguard S&P 500', ticker: 'VOO' },
  { id: 'vti', name: 'Vanguard Total Stock', ticker: 'VTI' },
];
const availableSectors = [
  { id: 'tech', name: 'التكنولوجيا', icon: '💻' },
  { id: 'healthcare', name: 'الرعاية الصحية', icon: '🏥' },
  { id: 'finance', name: 'المالية', icon: '🏦' },
  { id: 'energy', name: 'الطاقة', icon: '⚡' },
  { id: 'consumer', name: 'السلع الاستهلاكية', icon: '🛒' },
  { id: 'industrial', name: 'الصناعة', icon: '🏭' },
  { id: 'utilities', name: 'الخدمات', icon: '💡' },
  { id: 'realestate', name: 'العقارات', icon: '🏢' },
];
const availableCompanies = [
  { id: 'aapl', name: 'Apple Inc.', ticker: 'AAPL', sector: 'tech' },
  { id: 'msft', name: 'Microsoft', ticker: 'MSFT', sector: 'tech' },
  { id: 'googl', name: 'Alphabet', ticker: 'GOOGL', sector: 'tech' },
  { id: 'amzn', name: 'Amazon', ticker: 'AMZN', sector: 'consumer' },
  { id: 'tsla', name: 'Tesla', ticker: 'TSLA', sector: 'consumer' },
  { id: 'meta', name: 'Meta', ticker: 'META', sector: 'tech' },
  { id: 'nvda', name: 'NVIDIA', ticker: 'NVDA', sector: 'tech' },
  { id: 'jpm', name: 'JPMorgan', ticker: 'JPM', sector: 'finance' },
  { id: 'jnj', name: 'Johnson & Johnson', ticker: 'JNJ', sector: 'healthcare' },
  { id: 'unh', name: 'UnitedHealth', ticker: 'UNH', sector: 'healthcare' },
  { id: 'xom', name: 'Exxon Mobil', ticker: 'XOM', sector: 'energy' },
  { id: 'cvx', name: 'Chevron', ticker: 'CVX', sector: 'energy' },
];
const availableMarkets = [
  { id: 'us', name: 'السوق الأمريكي', flag: '🇺🇸' },
  { id: 'uk', name: 'السوق البريطاني', flag: '🇬🇧' },
  { id: 'eu', name: 'السوق الأوروبي', flag: '🇪🇺' },
  { id: 'jp', name: 'السوق الياباني', flag: '🇯🇵' },
  { id: 'hk', name: 'السوق الهونغ كونغي', flag: '🇭🇰' },
];

const defaultEmployees: User[] = [
  {
    id: '1', name: 'أحمد العلي', email: 'ahmed.ali@qafah.com',
    role: 'market_supervisor', permissions: defaultPermissions.market_supervisor,
    assignedIndices: ['sp500', 'nasdaq'], assignedFunds: ['spy', 'qqq'],
    assignedSectors: ['tech', 'finance'], assignedCompanies: ['aapl', 'msft', 'googl', 'amzn'],
    assignedMarkets: ['us', 'uk', 'eu'], isActive: true, createdAt: '2024-01-15', lastLogin: '2024-03-20 14:30',
  },
  {
    id: '2', name: 'سارة محمد', email: 'sara.mohammed@qafah.com',
    role: 'us_market_supervisor', permissions: defaultPermissions.us_market_supervisor,
    assignedIndices: ['sp500', 'nasdaq', 'dowjones'], assignedFunds: ['spy', 'qqq', 'dia'],
    assignedSectors: ['tech', 'healthcare', 'consumer'], assignedCompanies: ['aapl', 'msft', 'meta', 'jnj', 'tsla'],
    assignedMarkets: ['us'], isActive: true, createdAt: '2024-02-01', lastLogin: '2024-03-19 09:15',
  },
  {
    id: '3', name: 'خالد عبدالرحمن', email: 'khaled.ar@qafah.com',
    role: 'employee', permissions: defaultPermissions.employee,
    assignedIndices: ['sp500'], assignedFunds: ['spy'], assignedSectors: ['tech'],
    assignedCompanies: ['aapl', 'msft'], assignedMarkets: ['us'],
    isActive: true, createdAt: '2024-02-15', lastLogin: '2024-03-18 16:45',
  },
  {
    id: '4', name: 'نورة الفهد', email: 'noura.fahd@qafah.com',
    role: 'employee', permissions: defaultPermissions.employee,
    assignedIndices: ['nasdaq'], assignedFunds: ['qqq'], assignedSectors: ['healthcare', 'finance'],
    assignedCompanies: ['jnj', 'unh', 'jpm'], assignedMarkets: ['us'],
    isActive: false, createdAt: '2024-03-01', lastLogin: '2024-03-10 11:20',
  },
];

const roleLabels: Record<UserRole, { label: string; color: string; icon: any }> = {
  admin:                { label: 'مدير النظام',           color: 'bg-red-100 text-red-700',    icon: Shield },
  market_supervisor:    { label: 'مشرف الأسواق',          color: 'bg-purple-100 text-purple-700', icon: Globe },
  us_market_supervisor: { label: 'مشرف السوق الأمريكي',   color: 'bg-blue-100 text-blue-700',  icon: TrendingUp },
  employee:             { label: 'موظف',                  color: 'bg-green-100 text-green-700', icon: Briefcase },
};

interface AdminEmployeesProps {
  navigate?: (page: string) => void;
  onLogout?: () => void;
}

export function AdminEmployees({ navigate, onLogout }: AdminEmployeesProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employees, setEmployees]     = useState<User[]>(defaultEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter]   = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen]   = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [newEmployee, setNewEmployee] = useState<Partial<User>>({
    name: '', email: '', role: 'employee',
    permissions: defaultPermissions.employee,
    assignedIndices: [], assignedFunds: [], assignedSectors: [],
    assignedCompanies: [], assignedMarkets: [], isActive: true,
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole   = roleFilter === 'all' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? emp.isActive : !emp.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) return;
    const employee: User = {
      id: Date.now().toString(),
      name: newEmployee.name!, email: newEmployee.email!,
      role: newEmployee.role as UserRole,
      permissions: defaultPermissions[newEmployee.role as UserRole],
      assignedIndices: newEmployee.assignedIndices || [],
      assignedFunds: newEmployee.assignedFunds || [],
      assignedSectors: newEmployee.assignedSectors || [],
      assignedCompanies: newEmployee.assignedCompanies || [],
      assignedMarkets: newEmployee.assignedMarkets || [],
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '-',
    };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', email: '', role: 'employee', permissions: defaultPermissions.employee, assignedIndices: [], assignedFunds: [], assignedSectors: [], assignedCompanies: [], assignedMarkets: [], isActive: true });
    setIsAddDialogOpen(false);
  };

  const handleEditEmployee = () => {
    if (!selectedEmployee) return;
    setEmployees(employees.map(emp => emp.id === selectedEmployee.id ? selectedEmployee : emp));
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    setShowDeleteConfirm(null);
  };

  const toggleEmployeeStatus = (id: string) =>
    setEmployees(employees.map(emp => emp.id === id ? { ...emp, isActive: !emp.isActive } : emp));

  const toggleArrayItem = (array: string[], item: string) =>
    array.includes(item) ? array.filter(i => i !== item) : [...array, item];

  const getRoleBadge = (role: UserRole) => {
    const { label, color, icon: Icon } = roleLabels[role];
    return <Badge className={color}><Icon className="w-3 h-3 ml-1" />{label}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) =>
    isActive ? (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 ml-1" />نشط</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 ml-1" />غير نشط</Badge>
    );

  const renderEmployeeForm = (employee: Partial<User>, setEmployee: (e: Partial<User>) => void) => (
    <div className="space-y-6 max-h-[65vh] overflow-y-auto p-1" dir="rtl">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4" /> المعلومات الأساسية
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <Input value={employee.name || ''} onChange={(e) => setEmployee({ ...employee, name: e.target.value })} placeholder="أدخل اسم الموظف" />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" value={employee.email || ''} onChange={(e) => setEmployee({ ...employee, email: e.target.value })} placeholder="email@qafah.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>الدور الوظيفي</Label>
          <Select value={employee.role} onValueChange={(value: UserRole) => setEmployee({ ...employee, role: value, permissions: defaultPermissions[value] })}>
            <SelectTrigger><SelectValue placeholder="اختر الدور الوظيفي" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدير النظام</SelectItem>
              <SelectItem value="market_supervisor">مشرف الأسواق</SelectItem>
              <SelectItem value="us_market_supervisor">مشرف السوق الأمريكي</SelectItem>
              <SelectItem value="employee">موظف</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="indices">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-600" /><span>المؤشرات</span><Badge variant="secondary" className="mr-2">{(employee.assignedIndices || []).length}</Badge></div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 p-2">
              {availableIndices.map((index) => (
                <div key={index.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox id={`index-${index.id}`} checked={(employee.assignedIndices || []).includes(index.id)} onCheckedChange={() => setEmployee({ ...employee, assignedIndices: toggleArrayItem(employee.assignedIndices || [], index.id) })} />
                  <Label htmlFor={`index-${index.id}`} className="text-sm cursor-pointer">{index.name} ({index.code})</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="funds">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-blue-600" /><span>الصناديق</span><Badge variant="secondary" className="mr-2">{(employee.assignedFunds || []).length}</Badge></div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 p-2">
              {availableFunds.map((fund) => (
                <div key={fund.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox id={`fund-${fund.id}`} checked={(employee.assignedFunds || []).includes(fund.id)} onCheckedChange={() => setEmployee({ ...employee, assignedFunds: toggleArrayItem(employee.assignedFunds || [], fund.id) })} />
                  <Label htmlFor={`fund-${fund.id}`} className="text-sm cursor-pointer">{fund.name} ({fund.ticker})</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sectors">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2"><PieChart className="w-4 h-4 text-green-600" /><span>القطاعات</span><Badge variant="secondary" className="mr-2">{(employee.assignedSectors || []).length}</Badge></div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 p-2">
              {availableSectors.map((sector) => (
                <div key={sector.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox id={`sector-${sector.id}`} checked={(employee.assignedSectors || []).includes(sector.id)} onCheckedChange={() => setEmployee({ ...employee, assignedSectors: toggleArrayItem(employee.assignedSectors || [], sector.id) })} />
                  <Label htmlFor={`sector-${sector.id}`} className="text-sm cursor-pointer">{sector.icon} {sector.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="companies">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-orange-600" /><span>الشركات</span><Badge variant="secondary" className="mr-2">{(employee.assignedCompanies || []).length}</Badge></div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 p-2 max-h-48 overflow-y-auto">
              {availableCompanies.map((company) => (
                <div key={company.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox id={`company-${company.id}`} checked={(employee.assignedCompanies || []).includes(company.id)} onCheckedChange={() => setEmployee({ ...employee, assignedCompanies: toggleArrayItem(employee.assignedCompanies || [], company.id) })} />
                  <Label htmlFor={`company-${company.id}`} className="text-sm cursor-pointer">{company.ticker} - {company.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="markets">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-600" /><span>الأسواق</span><Badge variant="secondary" className="mr-2">{(employee.assignedMarkets || []).length}</Badge></div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 p-2">
              {availableMarkets.map((market) => (
                <div key={market.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox id={`market-${market.id}`} checked={(employee.assignedMarkets || []).includes(market.id)} onCheckedChange={() => setEmployee({ ...employee, assignedMarkets: toggleArrayItem(employee.assignedMarkets || [], market.id) })} />
                  <Label htmlFor={`market-${market.id}`} className="text-sm cursor-pointer">{market.flag} {market.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="permissions">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-red-600" /><span>الصلاحيات التفصيلية</span></div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-2">
              {[
                { title: 'إدارة المستخدمين', perms: [{ key: 'canManageUsers', label: 'إدارة المستخدمين' }, { key: 'canManageEmployees', label: 'إدارة الموظفين' }, { key: 'canAssignPermissions', label: 'تعيين الصلاحيات' }] },
                { title: 'الإشعارات', perms: [{ key: 'canViewAccumulationAlerts', label: 'إشعارات التجميع' }, { key: 'canViewDistributionAlerts', label: 'إشعارات التصريف' }, { key: 'canSendAlerts', label: 'إرسال الإشعارات' }] },
                { title: 'التداول', perms: [{ key: 'canCreateOptionContracts', label: 'إنشاء عقود أوبشن' }, { key: 'canViewOptionContracts', label: 'عرض العقود' }] },
                { title: 'المحافظ', perms: [{ key: 'canCreatePortfolio', label: 'إنشاء محفظة' }, { key: 'canViewOwnPortfolio', label: 'عرض المحفظة الخاصة' }] },
              ].map(({ title, perms }) => (
                <div key={title} className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <div key={perm.key} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox id={`perm-${perm.key}`} checked={(employee.permissions as any)?.[perm.key] || false} onCheckedChange={(checked) => setEmployee({ ...employee, permissions: { ...(employee.permissions || {}), [perm.key]: checked } as any })} />
                        <Label htmlFor={`perm-${perm.key}`} className="text-sm cursor-pointer">{perm.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900" dir="rtl">

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside
        className={`
          flex-shrink-0 flex flex-col
          bg-white dark:bg-slate-800
          border-l border-slate-200 dark:border-slate-700
          transition-all duration-300 overflow-hidden
          ${sidebarOpen ? 'w-64' : 'w-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700 min-w-[16rem]">
          <img src="/logo.png" alt="قافة" className="h-10 w-auto" />
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 min-w-[16rem]">
          <button
            onClick={() => navigate?.('admin')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            <TrendingUp className="w-5 h-5 shrink-0" /><span>نظرة عامة</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
            <Users className="w-5 h-5 shrink-0" /><span>الموظفين</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
            <Activity className="w-5 h-5 shrink-0" /><span>الإشعارات</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
            <Settings className="w-5 h-5 shrink-0" /><span>الإعدادات</span>
          </button>

          {/* ── Go to User Dashboard ── */}
          <button
            onClick={() => navigate?.('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" /><span>لوحة المستخدم</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 min-w-[16rem]">
          <button
            onClick={() => onLogout?.()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" /><span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">إدارة الموظفين</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">أد</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-auto" dir="rtl">

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'إجمالي الموظفين', value: employees.length, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', Icon: Users },
              { label: 'الموظفين النشطين', value: employees.filter(e => e.isActive).length, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', Icon: UserCheck, valueColor: 'text-green-600' },
              { label: 'المشرفين', value: employees.filter(e => e.role === 'market_supervisor' || e.role === 'us_market_supervisor').length, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', Icon: Shield, valueColor: 'text-purple-600' },
              { label: 'غير النشطين', value: employees.filter(e => !e.isActive).length, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', Icon: EyeOff, valueColor: 'text-red-600' },
            ].map(({ label, value, color, Icon, valueColor }) => (
              <Card key={label}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                      <p className={`text-2xl font-bold ${valueColor || 'text-slate-900 dark:text-white'}`}>{value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex gap-4 flex-1 flex-wrap">
              <div className="relative flex-1 max-w-md min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input placeholder="البحث عن موظف..." className="pr-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
                <SelectTrigger className="w-44"><Filter className="w-4 h-4 ml-2" /><SelectValue placeholder="الدور الوظيفي" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="admin">مدير النظام</SelectItem>
                  <SelectItem value="market_supervisor">مشرف الأسواق</SelectItem>
                  <SelectItem value="us_market_supervisor">مشرف السوق الأمريكي</SelectItem>
                  <SelectItem value="employee">موظف</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
                <SelectTrigger className="w-32"><SelectValue placeholder="الحالة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700"><UserPlus className="w-4 h-4 ml-2" />إضافة موظف</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-purple-600" />إضافة موظف جديد</DialogTitle>
                </DialogHeader>
                {renderEmployeeForm(newEmployee, setNewEmployee)}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleAddEmployee}><Save className="w-4 h-4 ml-2" />حفظ</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-purple-600" />قائمة الموظفين</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">الدور</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">المؤشرات</TableHead>
                      <TableHead className="text-right">الشركات</TableHead>
                      <TableHead className="text-right">الأسواق</TableHead>
                      <TableHead className="text-right">آخر دخول</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{employee.name}</div>
                            <div className="text-sm text-slate-500">{employee.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(employee.role)}</TableCell>
                        <TableCell>{getStatusBadge(employee.isActive)}</TableCell>
                        <TableCell><Badge variant="secondary">{employee.assignedIndices.length}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{employee.assignedCompanies.length}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{employee.assignedMarkets.length}</Badge></TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">{employee.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => { setSelectedEmployee(employee); setIsEditDialogOpen(true); }}>
                              <Edit className="w-4 h-4 text-slate-500" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => toggleEmployeeStatus(employee.id)}>
                              {employee.isActive ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                            </button>
                            <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => setShowDeleteConfirm(employee.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">عرض {filteredEmployees.length} من {employees.length} موظف</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled><ChevronRight className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" disabled><ChevronLeft className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5 text-purple-600" />تعديل بيانات الموظف</DialogTitle>
          </DialogHeader>
          {selectedEmployee && renderEmployeeForm(selectedEmployee, (e) => setSelectedEmployee(e as User))}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleEditEmployee}><Save className="w-4 h-4 ml-2" />حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" />تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 dark:text-slate-300 py-4">هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => showDeleteConfirm && handleDeleteEmployee(showDeleteConfirm)}>
              <Trash2 className="w-4 h-4 ml-2" />حذف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}