import { useState } from 'react';
import { Button } from '@/components/ui/button';

const QafahLogo = ({ className = "" }: { className?: string }) => (
  <img
    src="https://app.qafah.com/static/logo.png"
    alt="Qafah Logo"
    className={className}
  />
);
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye, EyeOff, Mail, Lock, Loader2, AlertCircle,
  LayoutDashboard, Shield,
} from 'lucide-react';
import type { AuthUser } from '@/hooks/useAuth';

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard' | 'admin-employees' | 'companies-accumulation' | 'premarket';

interface LoginProps {
  navigate: (page: Page) => void;
  navigateAfterLogin: (page: Page) => void;
  login: (username: string, password: string, rememberMe: boolean) => Promise<{
    success: boolean;
    role?: AuthUser['role'];
    error?: string;
  }>;
  isLoading: boolean;
  /** Pass the global auth error from useAuth so it's always shown */
  authError?: string | null;
}

type LoginTab = 'user' | 'admin';

// ══════════════════════════════════════════════════════════════════════════════
export function Login({ navigate, navigateAfterLogin, login, isLoading, authError }: LoginProps) {
  const [activeTab, setActiveTab]       = useState<LoginTab>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError]       = useState<string | null>(null);
  const [shake, setShake]               = useState(false);
  const [formData, setFormData] = useState({
    username:   '',
    password:   '',
    rememberMe: true,
  });

  // Prefer local formError; fall back to the hook-level authError
  const displayedError = formError ?? authError ?? null;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleTabChange = (tab: LoginTab) => {
    setActiveTab(tab);
    setFormError(null);
    setFormData({ username: '', password: '', rememberMe: true });
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.username.trim() || !formData.password) {
      setFormError('يرجى تعبئة جميع الحقول');
      triggerShake();
      return;
    }

    const result = await login(
      formData.username.trim(),
      formData.password,
      formData.rememberMe,
    );

    if (!result.success) {
      // result.error is always set on failure from the fixed useAuth
      setFormError(result.error ?? 'اسم المستخدم أو كلمة المرور غير صحيحة');
      triggerShake();
      return;
    }

    if (activeTab === 'admin') {
      if (result.role !== 'admin') {
        setFormError('هذا الحساب ليس حساب مسؤول. يرجى استخدام تسجيل دخول المستخدم.');
        triggerShake();
        return;
      }
      navigateAfterLogin('admin');
    } else {
      const rolePageMap: Record<string, Page> = {
        market_supervisor:    'employee',
        us_market_supervisor: 'employee',
        employee:             'employee',
        user:                 'dashboard',
        admin:                'dashboard',
      };
      navigateAfterLogin(rolePageMap[result.role ?? ''] ?? 'dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-20 right-10 w-72 h-72 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-purple-300/20 dark:bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Shake keyframes injected inline */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .shake { animation: shake 0.45s ease; }
      `}</style>

      <div className={`relative w-full max-w-md ${shake ? 'shake' : ''}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('home')} className="inline-flex items-center justify-center">
            <QafahLogo className="h-16 w-auto object-contain" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg border border-slate-100 dark:border-slate-700 overflow-hidden">

          {/* ── Tab Switcher ── */}
          <div className="flex border-b border-slate-100 dark:border-slate-700">
            <button
              onClick={() => handleTabChange('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                activeTab === 'user'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              تسجيل دخول المستخدم
            </button>
            <button
              onClick={() => handleTabChange('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              تسجيل دخول المسؤول
            </button>
          </div>

          {/* ── Tab Indicator Banner ── */}
          <div className={`px-8 py-3 text-xs font-medium flex items-center gap-2 ${
            activeTab === 'admin'
              ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400'
              : 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
          }`} dir="rtl">
            {activeTab === 'admin' ? (
              <>
                <Shield className="w-3.5 h-3.5 shrink-0" />
                مخصص لحسابات المسؤولين فقط — ستنتقل إلى لوحة تحكم المسؤول
              </>
            ) : (
              <>
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                تسجيل الدخول للوصول إلى لوحة تحكم المستخدم
              </>
            )}
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {activeTab === 'admin' ? 'دخول المسؤول' : 'تسجيل الدخول'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {activeTab === 'admin'
                  ? 'أدخل بيانات حساب المسؤول للمتابعة'
                  : 'أهلاً بك مجدداً! أدخل بياناتك للمتابعة'}
              </p>
            </div>

            {/* ── Error Banner ── always visible when there's an error ── */}
            {displayedError && (
              <div
                className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-right"
                dir="rtl"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{displayedError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 dark:text-slate-200">
                  اسم المستخدم أو البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="your@email.com"
                    value={formData.username}
                    onChange={(e) => {
                      setFormError(null);
                      setFormData({ ...formData, username: e.target.value });
                    }}
                    className={`pr-10 text-right ${displayedError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      setFormError(null);
                      setFormData({ ...formData, password: e.target.value });
                    }}
                    className={`pr-10 pl-10 text-right ${displayedError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rememberMe: checked as boolean })
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    تذكرني
                  </Label>
                </div>
                <button type="button" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors">
                  نسيت كلمة المرور؟
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className={`w-full text-white shadow transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ تسجيل الدخول...
                  </span>
                ) : activeTab === 'admin' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    دخول كمسؤول
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    تسجيل الدخول
                  </span>
                )}
              </Button>
            </form>

            {/* Register link */}
            <p className="text-center mt-6 text-slate-600 dark:text-slate-400" dir="rtl">
              ليس لديك حساب؟{' '}
              <button
                onClick={() => navigate('register')}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium transition-colors"
              >
                سجل الآن
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}