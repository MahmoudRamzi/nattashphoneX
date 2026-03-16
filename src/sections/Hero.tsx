import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  AreaChart, Area, ResponsiveContainer, YAxis, XAxis,
  CartesianGrid, Tooltip,
} from 'recharts';

import { Button }  from '@/components/ui/button';
import { Badge }   from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Bell, BarChart3, Loader2, AlertTriangle } from 'lucide-react';
import QafahLogo from '@/components/Qafah_logo';

/* ─── config ───────────────────────────────────────────── */
const API_BASE            = 'https://app.qafah.com';
const Glopal_home_ticker  = 'TEAM';

// Which QAFAH window to show in the hero chart (matches dashboard "نطاق قريب")
const HERO_WINDOW = 10;

/* ─── Arabic months (0-indexed, UTC-safe) ─────────────── */
const AR_MONTHS = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
];

function fmtDateAr(dateStr: string): string {
  // dateStr is "YYYY-MM-DD" — parse directly to avoid timezone shift
  const [, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${AR_MONTHS[parseInt(m) - 1]}`;
}

/* ─── helpers ──────────────────────────────────────────── */
function sparseTicks(dates: string[], count = 4): string[] {
  if (!dates.length) return [];
  if (dates.length <= count) return dates;
  const step = Math.floor(dates.length / count);
  return dates.filter((_, i) => i % step === 0);
}

/* ─── UptrendRecord type ───────────────────────────────── */
interface UptrendRecord {
  date: string;
  window: number;
  QL: number;
  [key: string]: any;
}

/* ─── QAFAH Hero Chart ─────────────────────────────────── */
function QafahHeroChart() {
  const [rows, setRows]     = useState<UptrendRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/etf/uptrend-sum?mode=cached`)
      .then(r => r.json())
      .then(d => setRows(d.up_trend_sum ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Derive hKey / lKey from the first record with the right window
  const { chartData, hKey, lKey } = useMemo(() => {
    const windowRows = rows
      .filter(r => r.window === HERO_WINDOW)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (!windowRows.length) return { chartData: [], hKey: '', lKey: '' };

    const sample = windowRows[0];
    const hKey   = Object.keys(sample).find(k => k.startsWith('h')) ?? '';
    const lKey   = Object.keys(sample).find(k => k.startsWith('l')) ?? '';

    const chartData = windowRows.map(r => ({
      date: r.date,
      QL:   r.QL,
      ...(hKey ? { [hKey]: r[hKey] } : {}),
      ...(lKey ? { [lKey]: r[lKey] } : {}),
    }));

    return { chartData, hKey, lKey };
  }, [rows]);

  const xTicks = useMemo(() => sparseTicks(chartData.map(d => d.date)), [chartData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!chartData.length) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 8, right: 4, left: 0, bottom: 4 }}
      >
        <defs>
          <linearGradient id="heroQL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.75} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

        <XAxis
          dataKey="date"
          ticks={xTicks}
          tickFormatter={fmtDateAr}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />

        {/* width={0} prevents any reserved dead space on the left */}
        <YAxis hide width={0} />

        <Tooltip content={() => null} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 2' }} />

        {/* Main QAFAH load line with gradient fill */}
        <Area
          type="monotone"
          dataKey="QL"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fill="url(#heroQL)"
          dot={false}
          isAnimationActive={false}
        />

        {/* High band */}
        {hKey && (
          <Area
            type="stepAfter"
            dataKey={hKey}
            stroke="#3b82f6"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            fill="none"
            dot={false}
            isAnimationActive={false}
          />
        )}

        {/* Low band */}
        {lKey && (
          <Area
            type="stepAfter"
            dataKey={lKey}
            stroke="#3b82f6"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            strokeOpacity={0.5}
            fill="none"
            dot={false}
            isAnimationActive={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Ticker Logo ──────────────────────────────────────── */
function TickerLogo({ ticker, size = 'md' }: { ticker: string; size?: 'sm' | 'md' | 'lg' }) {
  const [err, setErr] = useState(false);
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-lg text-xs',
    md: 'w-12 h-12 rounded-xl text-sm',
    lg: 'w-16 h-16 rounded-2xl text-base',
  };
  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow-lg`}>
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

/* ─── Types ────────────────────────────────────────────── */
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

interface HeroProps {
  navigate: (page: string) => void;
}

/* ─── Legend (matches dashboard style) ────────────────── */
function ChartLegend() { return null; }
{/*
  return (
    <div className="flex justify-center gap-4 mt-2" style={{ fontSize: 11, color: '#94a3b8' }}>
      <span className="flex items-center gap-1.5">
        <svg width="22" height="8">
          <line x1="0" y1="4" x2="22" y2="4" stroke="#8b5cf6" strokeWidth="2.5" />
          <circle cx="11" cy="4" r="3" fill="#8b5cf6" />
        </svg>
        QAFAH {HERO_WINDOW}-يوم
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="22" height="8">
          <line x1="0" y1="4" x2="22" y2="4" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5 3" />
        </svg>
        High / Low
      </span>
    </div>
  );
*/}

/* ─── Hero ─────────────────────────────────────────────── */
export function Hero({ navigate }: HeroProps) {
  const [featuredCompany, setFeaturedCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/ticker_resell_signals?mode=cached`)
      .then(r => r.json())
      .then((data: any[]) => {
        const rows = data
          .filter(r => r.holding_ticker === Glopal_home_ticker)
          .sort((a, b) => b.date.localeCompare(a.date));
        const latest = rows[0];
        if (latest) {
          setFeaturedCompany({
            ticker:         Glopal_home_ticker,
            signal:         latest.load_level_state === 'distribution' ? 'distribution' : 'accumulation',
            level:          latest.DiffCategory_1d,
            volume:         latest.weight?.toFixed(3) ?? '—',
            volumeType:     Math.abs(latest.load_direction) >= 3 ? 'high' : 'normal',
            dailyDirection: latest.load_direction,
            loadDiff1d:     rows[1] ? ((rows[0].load - rows[1].load) / rows[1].load) * 100 : 0,
            perf5d:         rows[4] ? ((rows[0].load - rows[4].load) / rows[4].load) * 100 : 0,
            perf10d:        rows[9] ? ((rows[0].load - rows[9].load) / rows[9].load) * 100 : 0,
            hittingDays:    Math.abs(latest.resell_counter_4),
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-purple-100/30 to-white min-h-screen overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: text + stats ── */}
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
                ابدأ الآن 
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>

            {/* Stats */}      
            {false && (      
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
            )}
            
          </div>
          

          {/* ── Right: card ── */}
          <div className="relative order-1 lg:order-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 relative">

              {/* Card header — QAFAH indicator title (no ticker) */}
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 ml-1" />
                  نطاق قريب · {HERO_WINDOW} أيام
                </Badge>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">مؤشر QAFAH</p>
                </div>
              </div>

              {/* ── QAFAH chart ── */}
              <div className="relative h-72 mb-1">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="opacity-10 transform scale-50">
                    <QafahLogo />
                  </div>
                </div>
                <QafahHeroChart />
              </div>

              {/* Legend */}
              <ChartLegend />

              {/* Card footer */}
              <div className="flex items-center justify-between mt-4">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 ml-1" />
                  مجاناً هذا الأسبوع
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-500">
                    {featuredCompany?.signal === 'accumulation' ? 'إشارة شراء فورية' : 'إشارة بيع فورية'}
                  </span>
                </div>
              </div>

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
              <p className="text-xs text-slate-400">© 2026 قافة - جميع الحقوق محفوظة</p>
            </div>
          </div>

        </div>

        {/* Under Construction Sign - Centered */}
        <div className="flex flex-col items-center justify-center mt-2">
          <div className="relative">
            <AlertTriangle className="w-40 h-40 text-amber-500 drop-shadow-lg animate-bounce" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-900">Under Construction</p>
            <p className="text-3xl font-bold text-amber-900">تحت الإنشاء</p>
          </div>
        </div>
      </div>
    </section>
  );
}