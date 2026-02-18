import { useState, useEffect } from 'react';
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

function HomePage({ isDark, toggleTheme, navigate }: { isDark: boolean; toggleTheme: () => void; navigate: (page: Page) => void }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />
      <main>
        <Hero navigate={(page: string) => navigate(page as Page)} />
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

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard' | 'admin-employees' | 'companies-accumulation' | 'premarket';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  switch (currentPage) {
    case 'login':
      return <Login navigate={navigate} />;
    case 'register':
      return <Register navigate={navigate} />;
    case 'pricing':
      return <PricingPage isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />;
    case 'education':
      return <Education isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />;
    case 'admin':
      return <AdminDashboard navigate={(page: string) => navigate(page as Page)} />;
    case 'admin-employees':
      return <AdminEmployees navigate={(page: string) => navigate(page as Page)} />;
    case 'companies-accumulation':
      return <CompaniesAccumulationPage />;
    case 'premarket':
      return <PreMarketServices navigate={(page: string) => navigate(page as Page)} />;
    case 'dashboard':
      return <UserDashboard navigate={navigate} />;
    case 'alerts':
      return <AlertsPage navigate={navigate} />;
    case 'employee':
      return <EmployeeDashboard navigate={navigate} />;
    case 'leaderboard':
      return <LeaderboardPage navigate={navigate} />;
    default:
      return <HomePage isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />;
  }
}

export default App;
