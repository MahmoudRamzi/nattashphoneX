import { UserPlus, Settings, Bell, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'أنشئ حسابك',
    description: 'سجل مجاناً في أقل من دقيقة واختر الباقة المناسبة لك',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Settings,
    title: 'حدد تفضيلاتك',
    description: 'اختر الشركات والمؤشرات التي تريد متابعتها بسهولة',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    icon: Bell,
    title: 'استلم الإشعارات',
    description: 'احصل على إشارات فورية عند حدوث أي تغيرات مهمة',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    icon: TrendingUp,
    title: 'تداول بذكاء',
    description: 'اتخذ قرارات استثمارية مدروسة بناءً على تحليلاتنا',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            كيف يعمل
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            ابدأ رحلتك في
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              {' '}4 خطوات بسيطة
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            عملية سهلة ومبسطة تبدأ بالتسجيل وتنتهي بالتداول بثقة
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 dark:from-purple-800 dark:via-purple-600 dark:to-purple-800" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center group">
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                  <step.icon className="w-10 h-10" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
