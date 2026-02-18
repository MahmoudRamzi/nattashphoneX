import { TrendingUp, BarChart3, Bell, FileText, Headphones, Smartphone, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'تحليل المؤشرات',
    description: 'إشارات يومية دقيقة لاتجاه السوق الأمريكي العام مع مخططات بيانية توضيحية',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: BarChart3,
    title: 'تحليل الشركات',
    description: 'تتبع حركات التجميع والتصريف لأكثر من 150 شركة مدرجة في المؤشرات الرئيسية',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    icon: Bell,
    title: 'إشارات فورية',
    description: 'تنبيهات لحظية عبر التطبيق والبريد الإلكتروني عند حدوث تغيرات مهمة',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    icon: FileText,
    title: 'تقارير متقدمة',
    description: 'تحليلات أسبوعية مفصلة مع توصيات استثمارية مدعومة بالبيانات',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Headphones,
    title: 'دعم فني 24/7',
    description: 'فريق متخصص جاهز لمساعدتك على مدار الساعة في أي استفسار',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  },
  {
    icon: Smartphone,
    title: 'واجهة سهلة',
    description: 'تصميم بسيط وبديهي يعمل على جميع الأجهزة بسلاسة تامة',
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  },
  {
    icon: Shield,
    title: 'بيانات آمنة',
    description: 'حماية كاملة لبياناتك مع تشفير متقدم وخصوصية تامة',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: Zap,
    title: 'سرعة تنفيذ',
    description: 'استلام الإشارات في أجزاء من الثانية دون أي تأخير',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  },
];

export function Features() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            لماذا قافة؟
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            كل ما تحتاجه للتداول
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              {' '}باحترافية
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            منصة متكاملة تجمع بين التحليل الفني المتقدم والإشارات الذكية لمساعدتك على اتخاذ قرارات استثمارية ناجحة
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
