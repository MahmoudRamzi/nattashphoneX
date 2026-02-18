import { Mail, Phone, MapPin, Twitter, Linkedin, Instagram } from 'lucide-react';

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin';

interface FooterProps {
  navigate?: (page: Page) => void;
}

export function Footer({ navigate }: FooterProps) {
  const handleNav = (page: Page) => {
    if (navigate) {
      navigate(page);
    }
  };

  const footerLinks = {
    product: [
      { label: 'المميزات', action: () => handleNav('home') },
      { label: 'الباقات', action: () => handleNav('pricing') },
      { label: 'التعليم', action: () => handleNav('education') },
    ],
    company: [
      { label: 'من نحن', action: () => {} },
      { label: 'المدونة', action: () => {} },
      { label: 'الوظائف', action: () => {} },
      { label: 'اتصل بنا', action: () => {} },
    ],
    support: [
      { label: 'مركز المساعدة', action: () => {} },
      { label: 'الأسئلة الشائعة', action: () => {} },
      { label: 'الشروط والأحكام', action: () => {} },
      { label: 'سياسة الخصوصية', action: () => {} },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button onClick={() => handleNav('home')} className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="قافة" className="h-12 w-auto" />
            </button>
            <p className="text-slate-400 mb-6 max-w-sm leading-relaxed">
              منصة ذكية للتداول تقدم إشارات وتحليلات احترافية للأسهم والخيارات الأمريكية. نساعدك على اتخاذ قرارات استثمارية ناجحة.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <span>support@qafah.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <span>+966 50 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">المنتج</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <button onClick={link.action} className="hover:text-purple-400 transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">الشركة</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button onClick={link.action} className="hover:text-purple-400 transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">الدعم</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <button onClick={link.action} className="hover:text-purple-400 transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 قافة. جميع الحقوق محفوظة.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-purple-600 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-purple-600 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-purple-600 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
