import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Shield, 
  Zap,
  Play,
  Clock,
  ChevronLeft
} from 'lucide-react';

const courses = [
  {
    icon: BookOpen,
    title: 'أساسيات التداول',
    description: 'تعلم المفاهيم الأساسية للتداول في الأسواق المالية',
    lessons: 12,
    duration: '3 ساعات',
    level: 'مبتدئ',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    icon: TrendingUp,
    title: 'التحليل الفني',
    description: 'أدوات واستراتيجيات التحليل الفني للأسواق',
    lessons: 18,
    duration: '5 ساعات',
    level: 'متوسط',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    icon: BarChart3,
    title: 'قراءة الشارت',
    description: 'كيفية قراءة وتحليل الرسوم البيانية باحترافية',
    lessons: 15,
    duration: '4 ساعات',
    level: 'متوسط',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    icon: PieChart,
    title: 'إدارة المخاطر',
    description: 'استراتيجيات إدارة المخاطر والمحافظة على رأس المال',
    lessons: 10,
    duration: '2.5 ساعة',
    level: 'متقدم',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Shield,
    title: 'علم النفس التداولي',
    description: 'التحكم في العواطف واتخاذ قرارات منطقية',
    lessons: 8,
    duration: '2 ساعة',
    level: 'متقدم',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  },
  {
    icon: Zap,
    title: 'استراتيجيات التداول',
    description: 'أفضل الاستراتيجيات للتداول اليومي والمتوسط',
    lessons: 20,
    duration: '6 ساعات',
    level: 'متقدم',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  },
];

const articles = [
  {
    title: 'ما هو التجميع والتصريف؟',
    excerpt: 'شرح مفصل لحركات التجميع والتصريف وكيفية الاستفادة منها في التداول',
    readTime: '5 دقائق',
  },
  {
    title: 'أهم المؤشرات الأمريكية',
    excerpt: 'دليل شامل لمؤشرات S&P 500 و Nasdaq و Dow Jones',
    readTime: '8 دقائق',
  },
  {
    title: 'كيف تقرأ إشارات قافة؟',
    excerpt: 'شرح تفصيلي لأنواع الإشارات ومعانيها',
    readTime: '6 دقائق',
  },
  {
    title: 'نصائح للمبتدئين',
    excerpt: 'أهم النصائح التي يجب معرفتها قبل بدء التداول',
    readTime: '4 دقائق',
  },
];

type Page = 'home' | 'login' | 'register' | 'pricing' | 'education' | 'admin';

interface EducationProps {
  isDark: boolean;
  toggleTheme: () => void;
  navigate: (page: Page) => void;
}

export function Education({ isDark, toggleTheme, navigate }: EducationProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                مركز التعليم
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                تعلم التداول
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                  {' '}من الصفر
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                دورات تعليمية شاملة ومقالات احترافية لتطوير مهاراتك في التداول
              </p>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  الدورات التعليمية
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  تعلم من الصفر حتى الاحتراف
                </p>
              </div>
              <Button variant="outline" className="hidden sm:flex">
                عرض الكل
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.title} className="group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl ${course.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <course.icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl text-slate-900 dark:text-white">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        <span>{course.lessons} درس</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                        {course.level}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  مقالات تعليمية
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  اقرأ وتعلم في أي وقت
                </p>
              </div>
              <Button variant="outline" className="hidden sm:flex">
                عرض الكل
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <Card key={article.title} className="group hover:shadow-card-hover transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime} قراءة</span>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 lg:p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                هل أنت جاهز للتداول؟
              </h2>
              <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
                ابدأ رحلتك في عالم التداول مع قافة واحصل على إشارات ذكية وتحليلات احترافية
              </p>
              <Button 
                size="lg" 
                className="bg-white text-purple-700 hover:bg-purple-50"
                onClick={() => navigate('register')}
              >
                ابدأ مجاناً
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
