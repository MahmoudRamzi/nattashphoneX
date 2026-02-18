import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Sparkles, Bell, BarChart3 } from 'lucide-react';

interface HeroProps {
  navigate: (page: string) => void;
}

export function Hero({ navigate }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-purple-100/30 to-white min-h-screen overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-right order-2 lg:order-1">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-6">
              <Sparkles className="w-4 h-4 ml-1" />
              إشارات ذكية بدقة 95%
            </Badge>

            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              منصتك الذكية
              <br />
              <span className="text-purple-600">للتداول الاحترافي</span>
            </h1>

            <p className="text-slate-600 text-lg mb-8 max-w-lg mr-auto">
              احصل على إشارات وتحليلات فورية للأسهم والخيارات الأمريكية. خوارزميات متطورة تكتشف فرص التداول المربحة قبل الجميع.
            </p>

            <div className="flex gap-4 justify-end mb-10">
              <Button 
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => navigate('pricing')}
              >
                تعرف على المزيد
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25"
                onClick={() => navigate('register')}
              >
                ابدأ الآن مجاناً
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 justify-end">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-green-500 text-sm">↗</span>
                  <span className="text-xl font-bold text-slate-900">+5000</span>
                </div>
                <p className="text-xs text-slate-500">مشترك نشط</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span className="text-xl font-bold text-slate-900">+150</span>
                </div>
                <p className="text-xs text-slate-500">شركة محللة</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-blue-500 text-sm">🛡</span>
                  <span className="text-xl font-bold text-slate-900">95%</span>
                </div>
                <p className="text-xs text-slate-500">دقة الإشارات</p>
              </div>
            </div>
          </div>

          {/* Right Side - Chart Card */}
          <div className="relative order-1 lg:order-2">
            {/* Main Chart Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6 relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700 border-0 mb-2">
                    <TrendingUp className="w-3 h-3 ml-1" />
                    تجميع
                  </Badge>
                  <p className="text-xs text-slate-400">مستوى عالي</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <div>
                      <p className="font-bold text-slate-900">AAPL</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-xl">
                      🍎
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right mb-4">
                <p className="text-green-500 font-bold text-lg">+2.45%</p>
                <p className="text-slate-900 text-2xl font-bold">$228.45</p>
                <p className="text-slate-400 text-sm">+$5.42 اليوم</p>
              </div>

              {/* Chart with Watermark */}
              <div className="relative h-48 mb-4">
                {/* Watermark Logo - More prominent */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="opacity-20">
                    <img src="/logo.png" alt="قافة" className="h-28 w-auto" />
                  </div>
                </div>
                
                <svg viewBox="0 0 400 150" className="w-full h-full relative z-0">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area Fill */}
                  <path
                    d="M0,120 Q50,115 100,100 T200,80 T300,50 T400,30 L400,150 L0,150 Z"
                    fill="url(#chartGradient)"
                  />
                  {/* Line */}
                  <path
                    d="M0,120 Q50,115 100,100 T200,80 T300,50 T400,30"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Current Point */}
                  <circle cx="400" cy="30" r="5" fill="#8b5cf6" stroke="white" strokeWidth="2" />
                </svg>
              </div>

              {/* Time Labels */}
              <div className="flex justify-between text-xs text-slate-400 mb-4">
                <span>16:00</span>
                <span>14:00</span>
                <span>12:00</span>
                <span>10:00</span>
              </div>

              {/* Free Badge */}
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 ml-1" />
                  مجاناً هذا الأسبوع
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-500">إشارة شراء فورية</span>
                </div>
              </div>
            </div>

            {/* Floating Notification Card */}
            <div className="absolute -left-4 top-1/3 z-20">
              <div className="bg-white rounded-xl shadow-lg p-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">إشعار فوري</p>
                    <p className="text-sm font-bold text-slate-900">عن الإشارات</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Free Stock Mini Card */}
            <div className="mt-4 flex justify-center">
              <div 
                className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 shadow-lg shadow-purple-600/30 cursor-pointer hover:shadow-xl hover:shadow-purple-600/40 transition-all"
                onClick={() => navigate('register')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
                    🍎
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">AAPL - Apple Inc.</p>
                    <p className="text-purple-200 text-sm">شركة الأسبوع المجانية</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-green-400 text-white border-0 text-xs">
                        <TrendingUp className="w-3 h-3 ml-1" />
                        +2.45%
                      </Badge>
                      <span className="text-white font-bold">$228.45</span>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-white mr-2" />
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                © 2026 قافة - جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
