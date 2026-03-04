import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Hero } from '@/sections/Hero';
import { Features } from '@/sections/Features';
import { HowItWorks } from '@/sections/HowItWorks';
import { Pricing } from '@/sections/Pricing';
import { Testimonials } from '@/sections/Testimonials';
import { CTA } from '@/sections/CTA';
import { SubscriberServices } from '@/sections/SubscriberServices';
import { OSICommunity } from '@/sections/OSICommunity';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { PricingPage } from '@/pages/PricingPage';
import { Education } from '@/pages/Education';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { UserDashboard } from '@/pages/UserDashboard';
import { AlertsPage } from '@/pages/AlertsPage';
import { EmployeeDashboard } from '@/pages/EmployeeDashboard';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { AdminEmployees } from '@/pages/AdminEmployees';
import { CompaniesAccumulationPage } from '@/pages/CompaniesAccumulationPage';
import { PreMarketServices } from '@/pages/PreMarketServices';
import TickerResellSignalsPage from '@/pages/TickerResellSignalsPage';
import { useAuth, getRoleHomePage } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
  | 'admin-employees' | 'companies-accumulation' | 'premarket'
  | 'ticker-resell-signals';

const PROTECTED_PAGES: Page[] = [
  'dashboard', 'alerts', 'employee', 'leaderboard',
  'admin', 'admin-employees', 'companies-accumulation', 'premarket',
  'ticker-resell-signals',
];
const ADMIN_ONLY_PAGES: Page[] = ['admin', 'admin-employees'];
const STAFF_ROLES = ['market_supervisor', 'us_market_supervisor', 'employee', 'admin'];

// ── Home page ────────────────────────────────────────────────────────────────
function HomePage({
  isDark, toggleTheme, navigate,
}: {
  isDark: boolean;
  toggleTheme: () => void;
  navigate: (page: Page) => void;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />
      <main>
        <Hero navigate={(p: string) => navigate(p as Page)} />
        <SubscriberServices />
        <OSICommunity />
        <Features />
        <HowItWorks />
        <Pricing navigate={navigate} />
        <Testimonials />
        <CTA navigate={navigate} />
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        <p className="text-slate-500 text-sm">جارٍ التحميل...</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
function App() {
  const [isDark, setIsDark]           = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Tracks whether we just did a post-login navigation so session-restore
  // auto-redirect doesn't override it.
  const postLoginRef = useRef(false);

  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  // Restore theme
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Auto-redirect on SESSION RESTORE (page refresh while logged in) only.
  // Skipped when postLoginRef is set — that means we already navigated intentionally.
  useEffect(() => {
    if (isLoading) return;
    if (postLoginRef.current) {
      postLoginRef.current = false;
      return;
    }
    if (isAuthenticated && user && ['login', 'register', 'home'].includes(currentPage)) {
      setCurrentPage(getRoleHomePage(user.role) as Page);
      window.scrollTo(0, 0);
    }
  }, [isLoading, isAuthenticated, user]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // ── navigateAfterLogin ───────────────────────────────────────────────────
  // Called by Login.tsx after a successful login. Bypasses the isAuthenticated
  // guard entirely because we know auth just succeeded — isAuthenticated hasn't
  // updated yet (React state is async), but the login is valid.
  const navigateAfterLogin = (page: Page) => {
    postLoginRef.current = true;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // ── navigate ─────────────────────────────────────────────────────────────
  // Normal navigation used everywhere else — enforces auth guards.
  const navigate = (page: Page) => {
    if (PROTECTED_PAGES.includes(page) && !isAuthenticated) {
      setCurrentPage('login');
      window.scrollTo(0, 0);
      return;
    }
    if (ADMIN_ONLY_PAGES.includes(page) && user?.role !== 'admin') {
      setCurrentPage(isAuthenticated ? (getRoleHomePage(user!.role) as Page) : 'home');
      window.scrollTo(0, 0);
      return;
    }
    if (page === 'employee' && !STAFF_ROLES.includes(user?.role ?? '')) {
      setCurrentPage(isAuthenticated ? (getRoleHomePage(user!.role) as Page) : 'home');
      window.scrollTo(0, 0);
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    postLoginRef.current = false;
    await logout();
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  if (isLoading) return <AppLoader />;

  switch (currentPage) {
    case 'login':
      // Pass navigateAfterLogin so Login bypasses the auth guard
      return (
        <Login
          navigate={navigate}
          navigateAfterLogin={navigateAfterLogin}
          login={login}
          isLoading={isLoading}
        />
      );

    case 'register':
      return <Register navigate={navigate} />;

    case 'pricing':
      return <PricingPage isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />;

    case 'education':
      return <Education isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />;

    case 'admin':
      return <AdminDashboard navigate={(p) => navigate(p as Page)} onLogout={handleLogout} />;

    case 'admin-employees':
      return <AdminEmployees navigate={(p) => navigate(p as Page)} onLogout={handleLogout} />;

    case 'companies-accumulation':
      return <CompaniesAccumulationPage navigate={navigate} onLogout={handleLogout} user={user} />;

    case 'premarket':
      return <PreMarketServices navigate={(p) => navigate(p as Page)} />;

    case 'dashboard':
      return <UserDashboard navigate={navigate} onLogout={handleLogout} user={user} />;

    case 'alerts':
      return <AlertsPage navigate={navigate} />;

    case 'employee':
      return <EmployeeDashboard navigate={navigate} />;

    case 'leaderboard':
      return <LeaderboardPage navigate={navigate} />;

    case 'ticker-resell-signals':
      return <TickerResellSignalsPage />;

    default:
      return <HomePage isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />;
  }
}

export default App;