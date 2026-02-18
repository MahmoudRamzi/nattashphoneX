import { Pricing } from '@/sections/Pricing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Check, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'هل يمكنني تغيير باقتي في أي وقت؟',
    answer: 'نعم، يمكنك الترقية أو التخفيض في أي وقت. عند الترقية، سيتم احتساب الفرق المتبقي من فترة اشتراكك الحالية.',
  },
  {
    question: 'هل هناك فترة تجريبية مجانية؟',
    answer: 'نعم، الباقة المجانية متاحة للجميع بدون وقت محدد. يمكنك تجربة المنصة وترقية باقتك عندما تشعر بالراحة.',
  },
  {
    question: 'كيف يتم تجديد الشركات الأسبوعية؟',
    answer: 'يتم تجديد قائمة الشركات في نهاية كل أسبوع (السبت والأحد). يمكنك تغيير اختياراتك من لوحة التحكم بسهولة.',
  },
  {
    question: 'هل يمكنني استرداد المبلغ؟',
    answer: 'نعم، نقدم ضمان استرداد المبلغ خلال 7 أيام من تاريخ الاشتراك إذا لم تكن راضياً عن الخدمة.',
  },
  {
    question: 'ما هي طرق الدفع المتاحة؟',
    answer: 'نقبل جميع البطاقات الائتمانية، مدى، Apple Pay، Google Pay، والتحويل البنكي.',
  },
];

const comparisonFeatures = [
  { name: 'عدد الشركات (تجميع/تصريف)', free: '1', silver: '5', gold: '10', platinum: '20' },
  { name: 'اختيار الشركات', free: 'الأدمن', silver: 'المستخدم', gold: 'المستخدم', platinum: 'المستخدم' },
  { name: 'تجديد الشركات', free: 'كل اثنين', silver: 'كل سبت/أحد', gold: 'أسبوعي', platinum: 'مرن' },
  { name: 'شركات التحليل الفني', free: '-', silver: '10', gold: '30', platinum: '50' },
  { name: 'المؤشرات', free: '-', silver: '1', gold: 'الكل', platinum: 'الكل + خاصة' },
  { name: 'الصناديق', free: '-', silver: '1', gold: 'الكل', platinum: 'الكل' },
  { name: 'قنوات الإشعارات', free: 'موقع', silver: 'موقع + إيميل', gold: 'الكل', platinum: 'الكل + SMS' },
  { name: 'سرعة الإشعارات', free: 'عادية', silver: 'عادية', gold: 'سريعة', platinum: 'فورية' },
  { name: 'تقارير إضافية', free: '-', silver: '-', gold: 'أساسية', platinum: 'متقدمة' },
];

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin';

interface PricingPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  navigate: (page: Page) => void;
}

export function PricingPage({ isDark, toggleTheme, navigate }: PricingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />
      
      <main className="pt-20">
        <Pricing navigate={navigate} />

        {/* Comparison Table */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                مقارنة الباقات
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                قارن بين المميزات واختر ما يناسبك
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-right py-4 px-4 font-semibold text-slate-900 dark:text-white">الميزة</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">مجانية</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">فضية</th>
                    <th className="text-center py-4 px-4 font-semibold text-purple-600 dark:text-purple-400">ذهبية</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">بلاتينية</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{feature.name}</td>
                      <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">
                        {feature.free === '-' ? '-' : feature.free === 'الكل' || feature.free === 'الأدمن' || feature.free === 'المستخدم' ? feature.free : <Check className="w-5 h-5 mx-auto text-green-500" />}
                      </td>
                      <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">
                        {feature.silver === '-' ? '-' : feature.silver === 'الكل' || feature.silver === '1' || feature.silver === '10' ? feature.silver : <Check className="w-5 h-5 mx-auto text-green-500" />}
                      </td>
                      <td className="text-center py-4 px-4 text-purple-600 dark:text-purple-400 font-medium">
                        {feature.gold === '-' ? '-' : feature.gold === 'الكل' || feature.gold === '30' ? feature.gold : <Check className="w-5 h-5 mx-auto text-green-500" />}
                      </td>
                      <td className="text-center py-4 px-4 text-slate-600 dark:text-slate-400">
                        {feature.platinum === '-' ? '-' : feature.platinum === 'الكل + خاصة' || feature.platinum === 'الكل + SMS' || feature.platinum === '50' ? feature.platinum : <Check className="w-5 h-5 mx-auto text-green-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                <HelpCircle className="w-4 h-4" />
                <span>الأسئلة الشائعة</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                كل ما تريد معرفته
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-6"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-4">
                    <span className="text-slate-900 dark:text-white font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-400 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
