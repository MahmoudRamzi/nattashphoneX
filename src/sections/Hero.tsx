import React, { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import { ArrowLeft, TrendingUp, Sparkles, Bell, BarChart3, Loader2 } from 'lucide-react';



/* ─── config ───────────────────────────────────────────── */

const API_BASE = 'https://app.qafah.com';



/* ─── Ticker Logo Component ───────────────────────────── */

function TickerLogo({ ticker, size = 'md' }: { ticker: string; size?: 'sm' | 'md' | 'lg' }) {

  const [err, setErr] = useState(false);

  const sizeClasses = {

    sm: 'w-10 h-10 rounded-lg text-xs',

    md: 'w-12 h-12 rounded-xl text-sm',

    lg: 'w-16 h-16 rounded-2xl text-base'

  };

  const dim = sizeClasses[size];

  

  return (

    <div className={`${dim} bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-lg`}>

      {!err ? (

        <img

          src={`${API_BASE}/static/logos_tickers/${ticker}.png`}

          alt={ticker}

          className="w-full h-full object-contain"

          onError={() => setErr(true)}

        />

      ) : (

        <span className="text-white font-bold">{ticker.slice(0, 3)}</span>

      )}

    </div>

  );

}
/* ─── Hero Chart (Recharts with gradient fill) ───────── */
function HeroChart({ ticker = 'AAPL' }: { ticker?: string }) {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/chart/${ticker}`)
      .then(r => r.json())
      .then(d => {
        const points = d.dates.map((date: string, i: number) => ({
          date,
          value: d.weight[i],
        }));
        setData(points);
      })
      .catch(() => {});
  }, [ticker]);

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fill="url(#purpleGrad)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
/* ─── Types ───────────────────────────────────────────── */

interface CompanyData {

  ticker: string;

  signal: 'accumulation' | 'distribution';

  level: string;

  volume: string;

  volumeType: 'high' | 'normal';

  dailyDirection: number;

  loadDiff1d: number;

  hittingDays: number;

  perf5d: number;

  perf10d: number;

}



interface SignalsPayload {

  continuous: CompanyData[];

  sub: CompanyData[];

  change: CompanyData[];

  date: string;

}



/* ─── Hero Props ───────────────────────────────────────── */

interface HeroProps {

  navigate: (page: string) => void;

}



/* ─── Hero Component ───────────────────────────────────── */

export function Hero({ navigate }: HeroProps) {

  const [featuredCompany, setFeaturedCompany] = useState<CompanyData | null>(null);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    // Fetch signals data to get a featured company

    
// NEW
fetch(`${API_BASE}/api/ticker_resell_signals?mode=cached`)
  .then(r => r.json())
  .then((data: any[]) => {
    const aaplRows = data
      .filter(r => r.holding_ticker === 'AAPL')
      .sort((a, b) => b.date.localeCompare(a.date));
    const latest = aaplRows[0];
    if (latest) {
      setFeaturedCompany({
        ticker:        'AAPL',
        signal:        latest.load_level_state === 'distribution' ? 'distribution' : 'accumulation',
        level:         latest.DiffCategory_1d,
        volume:        latest.weight?.toFixed(3) ?? '—',
        volumeType:    Math.abs(latest.load_direction) >= 3 ? 'high' : 'normal',
        dailyDirection: latest.load_direction,
        loadDiff1d:    latest.load_direction,
        hittingDays:   Math.abs(latest.resell_counter_4),
        perf5d:        parseFloat(latest.WeightChangePerc_5d) || 0,
        perf10d:       parseFloat(latest.WeightChangePerc_3d) || 0,
      });
    }
    setLoading(false);
  })
  .catch(() => setLoading(false));
  }, []);



  return (

    <section className="relative bg-gradient-to-br from-purple-50 via-purple-100/30 to-white min-h-screen overflow-hidden">

      {/* Background Decoration */}

      <div className="absolute inset-0">

        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />

      </div>



      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

        <div className="grid lg:grid-cols-2 gap-12 items-center">



          {/* Left Side */}

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



          {/* Right Side */}

          <div className="relative order-1 lg:order-2">

            <div className="bg-white rounded-3xl shadow-xl p-6 relative">

              

              {loading ? (

                <div className="flex items-center justify-center h-96">

                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />

                </div>

              ) : featuredCompany ? (

                <>

                  {/* Header */}

                  <div className="flex items-start justify-between mb-4">

                    <div className="text-right">

                      <Badge className={`${

                        featuredCompany.signal === 'accumulation' 

                          ? 'bg-green-100 text-green-700' 

                          : 'bg-red-100 text-red-700'

                      } border-0 mb-2`}>

                        <TrendingUp className="w-3 h-3 ml-1" />

                        {featuredCompany.signal === 'accumulation' ? 'تجميع' : 'تصريف'}

                      </Badge>

                      <p className="text-xs text-slate-400">{featuredCompany.level}</p>

                    </div>

                    <div className="text-right">

                      <div className="flex items-center gap-2 justify-end">

                        <div>

                          <p className="font-bold text-slate-900">{featuredCompany.ticker}</p>

                        </div>

                        <TickerLogo ticker={featuredCompany.ticker} size="lg" />

                      </div>

                    </div>

                  </div>



                  {/* Price & Load Diff */}

                  <div className="text-right mb-4">

                    <p className={`font-bold text-lg ${

                      featuredCompany.loadDiff1d >= 0 ? 'text-green-500' : 'text-red-500'

                    }`}>

                      {featuredCompany.loadDiff1d >= 0 ? '+' : ''}{featuredCompany.loadDiff1d.toFixed(2)}%

                    </p>

                    <p className="text-slate-900 text-2xl font-bold">تغيير في الحمل</p>

                    <p className="text-slate-400 text-sm">

                      الحجم: {featuredCompany.volume} • {featuredCompany.volumeType === 'high' ? 'عالي' : 'طبيعي'}

                    </p>

                  </div>



                  {/* Performance badges */}

                  <div className="flex gap-2 justify-end mb-4">

                    <Badge className={`${

                      featuredCompany.perf5d >= 0 

                        ? 'bg-emerald-50 text-emerald-700' 

                        : 'bg-red-50 text-red-600'

                    } text-xs`}>

                      5 أيام: {featuredCompany.perf5d >= 0 ? '+' : ''}{featuredCompany.perf5d.toFixed(1)}%

                    </Badge>

                    <Badge className={`${

                      featuredCompany.perf10d >= 0 

                        ? 'bg-emerald-50 text-emerald-700' 

                        : 'bg-red-50 text-red-600'

                    } text-xs`}>

                      10 أيام: {featuredCompany.perf10d >= 0 ? '+' : ''}{featuredCompany.perf10d.toFixed(1)}%

                    </Badge>

                  </div>



                  {/* Chart */}

                  <div className="relative h-48 mb-4">

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">

                      <div className="opacity-20">

                        <img src="/logo.png" alt="قافة" className="h-28 w-auto" />

                      </div>

                    </div>

<HeroChart ticker="AAPL" />

                  </div>



                  {/* Footer */}

                  <div className="flex items-center justify-between">

                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">

                      <Sparkles className="w-3 h-3 ml-1" />

                      مجاناً هذا الأسبوع

                    </Badge>

                    <div className="flex items-center gap-2">

                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

                      <span className="text-xs text-slate-500">

                        {featuredCompany.signal === 'accumulation' ? 'إشارة شراء فورية' : 'إشارة بيع فورية'}

                      </span>

                    </div>

                  </div>

                </>

              ) : (

                <div className="flex items-center justify-center h-96 text-slate-400">

                  لا توجد بيانات متاحة

                </div>

              )}

            </div>



            {/* Floating notification */}

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