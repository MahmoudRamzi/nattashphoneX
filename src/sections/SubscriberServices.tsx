import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bookmark, 
  BarChart3, 
  Bell, 
  Target, 
  LineChart, 
  MessageCircle, 
  Users,
  ArrowRight,
  Star,
  Zap,
  Clock
} from 'lucide-react';

const services = [
  {
    icon: Clock,
    title: 'خدمات ما قبل التداول',
    description: 'تحديثات يومية قبل الافتتاح بساعة: التوزيعات، الحركة، الإعلانات',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    badge: 'جديد',
    features: ['قبل الافتتاح', 'تحديث يومي', 'ملاحظات المحللين']
  },
  {
    icon: Bookmark,
    title: 'قائمة المتابعة',
    description: 'أنشئ قائمة مخصصة بالشركات التي تتابعها واحصل على تنبيهات فورية لأي تغيير',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    badge: 'مميز',
    features: ['حتى 50 شركة', 'تنبيهات فورية', 'تقارير يومية']
  },
  {
    icon: BarChart3,
    title: 'شركات التجميع والتصريف',
    description: 'قائمة يومية محدثة بجميع الشركات التي عليها تجميع أو تصريف مع تحليل مفصل',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    badge: 'جديد',
    features: ['150+ شركة', 'تحديث يومي', 'تصنيف حسب القوة']
  },
  {
    icon: Bell,
    title: 'التنبيهات',
    description: 'تنبيهات لحظية عند حدوث تغييرات مهمة في الشركات المتابعة',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    badge: null,
    features: ['تنبيهات فورية', 'تخصيص القواعد', 'إشعارات متعددة']
  },
  {
    icon: Target,
    title: 'الفرص المتاحة',
    description: 'اكتشاف الفرص الاستثمارية المتاحة بناءً على التحليل الفني والزخم',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    badge: 'مميز',
    features: ['فرص يومية', 'تحليل شامل', 'نسبة نجاح عالية']
  },
  {
    icon: LineChart,
    title: 'شارت للشركات',
    description: 'رسوم بيانية تفاعلية مع مؤشرات فنية متقدمة لجميع الشركات',
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    badge: null,
    features: ['مؤشرات فنية', 'أطر زمنية متعددة', 'أدوات رسم']
  },
  {
    icon: MessageCircle,
    title: 'دردشة',
    description: 'تواصل مباشر مع فريق الدعم والمحللين للاستفسارات والمساعدة',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
    badge: null,
    features: ['دعم 24/7', 'رد فوري', 'استشارات']
  },
  {
    icon: Users,
    title: 'مجتمع أوسي',
    description: 'مجتمع تفاعلي للمشتركين لمشاركة الأفكار والاقتراحات والتعليق على الشركات',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    badge: 'جديد',
    features: ['مناقشات حية', 'أفكار متداولين', 'تقييمات']
  }
];

export function SubscriberServices() {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            خدمات المشترك
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            مجموعة متكاملة من الأدوات والخدمات لمساعدتك على اتخاذ قرارات استثمارية ناجحة
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card 
              key={service.title}
              className="group border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-7 h-7" />
                  </div>
                  {service.badge && (
                    <Badge className={`${service.badge === 'جديد' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      <Zap className="w-3 h-3 ml-1" />
                      {service.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                  {service.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {service.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.map((feature) => (
                    <span 
                      key={feature}
                      className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <Button variant="ghost" className="w-full group/btn hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <span className="text-purple-600">اكتشف المزيد</span>
                  <ArrowRight className="w-4 h-4 mr-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ابدأ رحلتك الاستثمارية اليوم
            </h3>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              انضم لآلاف المستثمرين الذين يثقون بمنصة قافة لاتخاذ قراراتهم الاستثمارية
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                <Star className="w-5 h-5 ml-2" />
                جرب مجاناً
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <ArrowRight className="w-5 h-5 mr-2" />
                تعرف على الباقات
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
