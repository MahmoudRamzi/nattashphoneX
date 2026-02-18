import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin';

interface CTAProps {
  navigate: (page: Page) => void;
}

export function CTA({ navigate }: CTAProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800" />
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative py-16 px-8 lg:px-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>ابدأ رحلتك الآن</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              جاهز لتبدأ رحلة التداول
              <span className="block text-purple-200">الاحترافية؟</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              انضم إلى آلاف المتداولين الناجحين واستفد من إشاراتنا الذكية وتحليلاتنا المتقدمة. ابدأ مجاناً اليوم!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-purple-700 hover:bg-purple-50 text-base px-8 shadow-lg"
                onClick={() => navigate('register')}
              >
                ابدأ مجاناً
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 text-base px-8"
                onClick={() => navigate('pricing')}
              >
                اكتشف الباقات
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-purple-200 text-sm">
              <span>✓ تسجيل مجاني</span>
              <span>✓ ضمان 7 أيام</span>
              <span>✓ إلغاء في أي وقت</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
