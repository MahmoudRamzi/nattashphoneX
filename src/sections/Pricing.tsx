import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, X, Sparkles, Crown, Gem, Star } from 'lucide-react';

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin';

interface PricingProps {
  navigate: (page: Page) => void;
}

interface Feature {
  text: string;
  included: boolean;
  limited?: boolean;
}

interface Plan {
  name: string;
  nameEn: string;
  icon: typeof Star;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: Feature[];
  cta: string;
  popular: boolean;
  color: string;
  textColor: string;
  isPremium?: boolean;
}

const plans: Plan[] = [
  {
    name: 'المجانية',
    nameEn: 'Free',
    icon: Star,
    description: 'للمبتدئين في عالم التداول',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: 'شركة واحدة أسبوعياً', included: true },
      { text: 'إشعارات التجميع والتصريف', included: true },
      { text: 'تحليل فني محدود', included: true, limited: true },
      { text: 'متابعة الشركات', included: false },
      { text: 'المؤشرات', included: false },
      { text: 'الصناديق الاستثمارية', included: false },
      { text: 'دعم فني', included: false },
      { text: 'تقارير متقدمة', included: false },
    ],
    cta: 'ابدأ مجاناً',
    popular: false,
    color: 'bg-slate-100 dark:bg-slate-700',
    textColor: 'text-slate-600 dark:text-slate-300',
  },
  {
    name: 'الفضية',
    nameEn: 'Silver',
    icon: Sparkles,
    description: 'للمتداولين النشطين',
    monthlyPrice: 99,
    yearlyPrice: 999,
    features: [
      { text: '5 شركات أسبوعياً', included: true },
      { text: 'إشعارات التجميع والتصريف', included: true },
      { text: 'تحليل فني لـ 10 شركات', included: true },
      { text: 'مؤشر واحد', included: true },
      { text: 'صندوق استثماري واحد', included: true },
      { text: 'جميع المؤشرات', included: false },
      { text: 'دعم فني', included: true },
      { text: 'تقارير متقدمة', included: false },
    ],
    cta: 'اشترك الآن',
    popular: false,
    color: 'bg-slate-200 dark:bg-slate-600',
    textColor: 'text-slate-700 dark:text-slate-200',
  },
  {
    name: 'الذهبية',
    nameEn: 'Gold',
    icon: Crown,
    description: 'للمتداولين المحترفين',
    monthlyPrice: 199,
    yearlyPrice: 1999,
    features: [
      { text: '10 شركات أسبوعياً', included: true },
      { text: 'إشعارات التجميع والتصريف', included: true },
      { text: 'تحليل فني لـ 30 شركة', included: true },
      { text: 'جميع المؤشرات', included: true },
      { text: 'جميع الصناديق', included: true },
      { text: 'أولوية في الإشعارات', included: true },
      { text: 'دعم فني مميز', included: true },
      { text: 'تقارير أساسية', included: true },
    ],
    cta: 'اشترك الآن',
    popular: true,
    color: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  {
    name: 'البلاتينية',
    nameEn: 'Platinum',
    icon: Gem,
    description: 'للمستثمرين الكبار',
    monthlyPrice: 399,
    yearlyPrice: 3999,
    features: [
      { text: '20 شركة أسبوعياً', included: true },
      { text: 'إشعارات فورية', included: true },
      { text: 'تحليل فني لـ 50 شركة', included: true },
      { text: 'جميع المؤشرات + خاصة', included: true },
      { text: 'جميع الصناديق', included: true },
      { text: 'إشعارات عبر جميع القنوات', included: true },
      { text: 'دعم فني على مدار الساعة', included: true },
      { text: 'تقارير متقدمة ومخصصة', included: true },
    ],
    cta: 'تواصل معنا',
    popular: false,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    textColor: 'text-white',
    isPremium: true,
  },
];

export function Pricing({ navigate }: PricingProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            الباقات
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            اختر الباقة
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
              {' '}المناسبة لك
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            باقات مرنة تناسب جميع المستويات، من المبتدئين إلى المحترفين
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              شهري
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
              سنوي
            </span>
            {isYearly && (
              <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                وفّر 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl overflow-hidden ${
                plan.popular
                  ? 'ring-2 ring-purple-500 shadow-purple-lg'
                  : 'border border-slate-200 dark:border-slate-700'
              } ${plan.isPremium ? 'text-white' : 'bg-white dark:bg-slate-800'}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white text-center py-1 text-sm font-medium">
                  الأكثر شيوعاً
                </div>
              )}

              <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center`}>
                    <plan.icon className={`w-6 h-6 ${plan.textColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">ريال</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    /{isYearly ? 'سنوياً' : 'شهرياً'}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-slate-400" />
                        </div>
                      )}
                      <span className={`text-sm ${feature.included ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                        {feature.text}
                        {feature.limited && (
                          <span className="text-xs text-slate-400 mr-1">(محدود)</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => navigate('register')}
                  className={`w-full ${
                    plan.isPremium
                      ? 'bg-white text-purple-600 hover:bg-purple-50'
                      : plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple hover:shadow-purple-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                  } transition-all`}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          جميع الباقات تشمل ضمان استرداد المبلغ خلال 7 أيام
        </p>
      </div>
    </section>
  );
}
