import { useState } from 'react';
import {
  Home, Phone, GraduationCap, ChevronDown, ChevronUp,
  Settings, PieChart, Activity, LogOut, Shield,
} from 'lucide-react';
import QafahLogo from '@/components/Qafah_logo';
import type { AuthUser } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────
type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
  | 'admin-employees' | 'companies-accumulation' | 'premarket'
  | 'ticker-resell-signals';

interface AppSidebarProps {
  navigate: (page: Page) => void;
  onLogout?: () => void;
  user?: AuthUser | null;
  activePage?: Page;
}

// ══════════════════════════════════════════════════════════════════════════════
export function AppSidebar({ navigate, onLogout, user, activePage }: AppSidebarProps) {
  const isAdmin = user?.role === 'admin';
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['portfolio', 'education']);

  const toggleMenu = (menu: string) =>
    setExpandedMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );

  const isActive = (page: Page) => activePage === page;

  const navItemCls = (page?: Page) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full transition-colors ${
      page && isActive(page)
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
    }`;

  const subItemCls = (page?: Page) =>
    `text-right px-3 py-2 rounded-lg text-sm w-full transition-colors ${
      page && isActive(page)
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
    }`;

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col py-4 px-3 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Logo */}
      <div className="px-4 pb-4 pt-1">
        <QafahLogo className="w-28 text-slate-800 dark:text-white" />
      </div>

      {/* Dashboard */}
      <button onClick={() => navigate('dashboard')} className={navItemCls('dashboard')}>
        <Home className="w-4 h-4" /> لوحة التحكم
      </button>

      {/* Calls */}
      <button className={navItemCls()}>
        <Phone className="w-4 h-4" /> Calls
      </button>

      {/* محفظتي — expandable */}
      <div>
        <button
          onClick={() => toggleMenu('portfolio')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="flex items-center gap-3 text-sm"><PieChart className="w-4 h-4" /> محفظتي</span>
          {expandedMenus.includes('portfolio') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedMenus.includes('portfolio') && (
          <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 dark:border-slate-700 pr-3">
            <button className={subItemCls()}>
              الأسواق
            </button>
            <button
              onClick={() => navigate('companies-accumulation')}
              className={subItemCls('companies-accumulation')}
            >
              فاحص السوق
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('ticker-resell-signals')}
                className={subItemCls('ticker-resell-signals')}
              >
                Advanced Chart
              </button>
            )}
          </div>
        )}
      </div>

      {/* Indicators Alerts */}
      <button className={navItemCls()}>
        <Activity className="w-4 h-4" /> Indicators Alerts
      </button>

      {/* التعليم — expandable */}
      <div>
        <button
          onClick={() => toggleMenu('education')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="flex items-center gap-3 text-sm"><GraduationCap className="w-4 h-4" /> التعليم</span>
          {expandedMenus.includes('education') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedMenus.includes('education') && (
          <div className="mr-4 mt-1 flex flex-col gap-0.5 border-r-2 border-slate-100 dark:border-slate-700 pr-3">
            <button className={subItemCls()}>Academy</button>
            <button className={subItemCls()}>Tutorials</button>
            <button className={subItemCls()}>Meeting</button>
          </div>
        )}
      </div>

      {/* ── Bottom actions ── */}
      <div className="mt-auto flex flex-col gap-1">
        {isAdmin && (
          <button
            onClick={() => navigate('admin')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm w-full transition-colors font-medium"
          >
            <Shield className="w-4 h-4" /> لوحة المسؤول
          </button>
        )}

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm w-full transition-colors">
          <Settings className="w-4 h-4" /> Settings
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm w-full transition-colors"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        )}
      </div>
    </aside>
  );
}