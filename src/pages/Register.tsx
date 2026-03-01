import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard' | 'admin-employees' | 'companies-accumulation' | 'premarket';

interface RegisterProps {
  navigate: (page: Page) => void;
}

interface FormData {
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  full_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.full_name.trim()) errors.full_name = 'الاسم الكامل مطلوب';
  else if (data.full_name.trim().length < 3) errors.full_name = 'الاسم يجب أن يكون 3 أحرف على الأقل';

  if (!data.username.trim()) errors.username = 'اسم المستخدم مطلوب';
  else if (data.username.trim().length < 3) errors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
  else if (!/^[a-zA-Z0-9_]+$/.test(data.username.trim())) errors.username = 'اسم المستخدم يقبل أحرف إنجليزية وأرقام فقط';

  if (!data.email.trim()) errors.email = 'البريد الإلكتروني مطلوب';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'البريد الإلكتروني غير صحيح';

  if (data.phone && !/^\+?[\d\s\-()]{7,15}$/.test(data.phone)) errors.phone = 'رقم الهاتف غير صحيح';

  if (!data.password) errors.password = 'كلمة المرور مطلوبة';
  else if (data.password.length < 8) errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';

  if (!data.confirmPassword) errors.confirmPassword = 'يرجى تأكيد كلمة المرور';
  else if (data.password !== data.confirmPassword) errors.confirmPassword = 'كلمتا المرور غير متطابقتين';

  return errors;
}

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const labels = ['ضعيفة', 'مقبولة', 'جيدة', 'قوية'];
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-slate-200 dark:bg-slate-700'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-orange-500' : score === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
        قوة كلمة المرور: {labels[score - 1] ?? 'ضعيفة جداً'}
      </p>
    </div>
  );
}

export function Register({ navigate }: RegisterProps) {
  const { register, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field error on change
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: undefined }));
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const result = await register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim() || undefined,
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setServerError(result.error ?? 'فشل إنشاء الحساب، حاول مجدداً');
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg p-10 border border-slate-100 dark:border-slate-700 w-full max-w-md text-center" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">تم إنشاء حسابك!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            تم تسجيل حسابك بنجاح. يمكنك الآن تسجيل الدخول والبدء في استخدام قافة.
          </p>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => navigate('login')}
          >
            تسجيل الدخول الآن
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-20 right-10 w-72 h-72 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-purple-300/20 dark:bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('home')} className="inline-flex items-center justify-center">
            <img src="/logo.png" alt="قافة" className="h-16 w-auto" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg p-8 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">إنشاء حساب جديد</h1>
            <p className="text-slate-600 dark:text-slate-400">ابدأ رحلتك مع قافة مجاناً</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-right" dir="rtl">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" dir="rtl" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-slate-700 dark:text-slate-200">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="أحمد محمد"
                  value={formData.full_name}
                  onChange={update('full_name')}
                  className={`pr-10 text-right ${formErrors.full_name ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
              {formErrors.full_name && <p className="text-xs text-red-500">{formErrors.full_name}</p>}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-slate-700 dark:text-slate-200">اسم المستخدم</Label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                <Input
                  id="username"
                  type="text"
                  placeholder="ahmed123"
                  value={formData.username}
                  onChange={update('username')}
                  className={`pr-10 text-left ${formErrors.username ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  disabled={isLoading}
                  autoComplete="username"
                  dir="ltr"
                />
              </div>
              {formErrors.username && <p className="text-xs text-red-500">{formErrors.username}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={update('email')}
                  className={`pr-10 text-left ${formErrors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  disabled={isLoading}
                  autoComplete="email"
                  dir="ltr"
                />
              </div>
              {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200">
                رقم الهاتف <span className="text-slate-400 text-xs font-normal">(اختياري)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+966 5X XXX XXXX"
                  value={formData.phone}
                  onChange={update('phone')}
                  className={`pr-10 text-left ${formErrors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  disabled={isLoading}
                  autoComplete="tel"
                  dir="ltr"
                />
              </div>
              {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={update('password')}
                  className={`pr-10 pl-10 text-right ${formErrors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  disabled={isLoading}
                  autoComplete="new-password"
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
              <PasswordStrength password={formData.password} />
              {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-200">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={update('confirmPassword')}
                  className={`pr-10 pl-10 text-right ${formErrors.confirmPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.confirmPassword && <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-purple hover:shadow-purple-lg transition-all mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ إنشاء الحساب...
                </span>
              ) : (
                'إنشاء الحساب'
              )}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center mt-6 text-slate-600 dark:text-slate-400" dir="rtl">
            لديك حساب بالفعل؟{' '}
            <button
              onClick={() => navigate('login')}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium transition-colors"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}