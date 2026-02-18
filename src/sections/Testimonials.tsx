import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'أحمد محمد',
    role: 'متداول محترف',
    content: 'قافة غيرت طريقة تداولي تماماً. الإشارات دقيقة جداً والتحليلات الفنية تساعدني على اتخاذ قرارات مدروسة. حققت أرباحاً جيدة منذ اشتراكي.',
    rating: 5,
    avatar: 'أم',
  },
  {
    name: 'سارة خالد',
    role: 'مستثمرة',
    content: 'أفضل منصة جربتها للتداول. الدعم الفني ممتاز والإشعارات الفورية تصل في الوقت المناسب تماماً. أنصح بها بشدة.',
    rating: 5,
    avatar: 'سخ',
  },
  {
    name: 'محمد عبدالله',
    role: 'متداول مبتدئ',
    content: 'بدأت مع الباقة المجانية وسرعان ما ترقيت للذهبية. التحليلات سهلة الفهم حتى للمبتدئين. شكراً لفريق قافة الرائع.',
    rating: 5,
    avatar: 'م ع',
  },
  {
    name: 'نورة الفهد',
    role: 'متداولة نشطة',
    content: 'دقة الإشارات مذهلة! حققت نسبة نجاح عالية في صفقاتي منذ استخدام المنصة. الباقة البلاتينية تستحق كل ريال.',
    rating: 5,
    avatar: 'نف',
  },
  {
    name: 'خالد سعيد',
    role: 'مستثمر طويل الأجل',
    content: 'التقارير الأسبوعية المتقدمة تساعدني على فهم السوق بشكل أعمق. منصة احترافية بمعنى الكلمة.',
    rating: 5,
    avatar: 'كس',
  },
  {
    name: 'فاطمة علي',
    role: 'متداولة',
    content: 'واجهة المستخدم سهلة وبديهية. حتى مع قليل الخبرة في التداول، استطعت فهم الإشارات والتحليلات بسرعة.',
    rating: 5,
    avatar: 'فع',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            آراء العملاء
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            ماذا يقول عملاؤنا
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              {' '}عن قافة
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            ثقة آلاف المتداولين في منصتنا هي شهادة على جودة خدماتنا
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-purple-200 dark:text-purple-800" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
