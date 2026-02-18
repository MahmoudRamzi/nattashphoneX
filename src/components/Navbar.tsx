import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Moon, Sun } from 'lucide-react';

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  navigate: (page: Page) => void;
}

export function Navbar({ isDark, toggleTheme, navigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { page: 'home' as Page, label: 'الرئيسية' },
    { page: 'pricing' as Page, label: 'الباقات' },
    { page: 'education' as Page, label: 'التعليم' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2 group">
            <img src="/logo.png" alt="قافة" className="h-10 w-auto" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button 
              variant="ghost" 
              className="text-slate-600 dark:text-slate-300"
              onClick={() => navigate('login')}
            >
              تسجيل الدخول
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-purple hover:shadow-purple-lg transition-all"
              onClick={() => navigate('register')}
            >
              ابدأ مجاناً
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    navigate(link.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-all text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-right"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigate('login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  تسجيل الدخول
                </Button>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    navigate('register');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  ابدأ مجاناً
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
