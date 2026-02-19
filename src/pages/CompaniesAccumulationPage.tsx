import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, RefreshCw, ArrowRightLeft,
  ShoppingCart, RotateCcw, Plus, Activity, ArrowUpDown,
  AlertCircle, Loader2, Search,
} from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────────────── */
interface CompanyData {
  ticker: string; name: string; logo: string;
  signal: 'accumulation' | 'distribution';
  level: string; volume: string; volumeType: 'high' | 'normal';
  dailyDirection: number; loadDiff1d: number; hittingDays: number;
  perf5d: number; perf10d: number; sector: string;
  category: 'continuous' | 'sub' | 'change';
}

interface SignalPoint { date: string; weight: number; level: number }

interface ChartPayload {
  ticker: string; window: number;
  dates: string[]; weight: number[];
  high_3: number[]; low_3: number[];
  high_4: number[]; low_4: number[];
  signals: {
    positive_real: SignalPoint[]; negative_real: SignalPoint[];
    positive_internal: SignalPoint[]; negative_internal: SignalPoint[];
  };
}

/* ─── static mock list ───────────────────────────────────────────────── */
const companiesData: CompanyData[] = [
  { ticker:'AAPL', name:'Apple',     logo:'🍎', signal:'accumulation', level:'MAJOR',  volume:'45.2M',  volumeType:'high',   dailyDirection:-1, loadDiff1d:-1.92, hittingDays:3, perf5d:2.29,   perf10d:9.15,  sector:'تكنولوجيا', category:'continuous' },
  { ticker:'NVDA', name:'NVIDIA',    logo:'🎮', signal:'accumulation', level:'MAJOR',  volume:'312.5M', volumeType:'high',   dailyDirection:-1, loadDiff1d:-3.21, hittingDays:3, perf5d:15.68,  perf10d:22.46, sector:'تكنولوجيا', category:'continuous' },
  { ticker:'MSFT', name:'Microsoft', logo:'💻', signal:'accumulation', level:'MAJOR',  volume:'22.1M',  volumeType:'normal', dailyDirection:1,  loadDiff1d:0.88,  hittingDays:3, perf5d:3.45,   perf10d:8.23,  sector:'تكنولوجيا', category:'continuous' },
  { ticker:'META', name:'Meta',      logo:'👥', signal:'distribution', level:'MAJOR',  volume:'18.3M',  volumeType:'normal', dailyDirection:1,  loadDiff1d:1.60,  hittingDays:2, perf5d:-1.82,  perf10d:3.20,  sector:'تكنولوجيا', category:'sub' },
  { ticker:'AMD',  name:'AMD',       logo:'🔷', signal:'distribution', level:'MAJOR',  volume:'65.8M',  volumeType:'high',   dailyDirection:1,  loadDiff1d:2.84,  hittingDays:3, perf5d:-10.54, perf10d:-12.11,sector:'تكنولوجيا', category:'sub' },
  { ticker:'DASH', name:'DoorDash',  logo:'🚗', signal:'distribution', level:'MAJOR',  volume:'8.5M',   volumeType:'normal', dailyDirection:1,  loadDiff1d:1.29,  hittingDays:2, perf5d:-7.55,  perf10d:-7.89, sector:'خدمات',   category:'sub' },
  { ticker:'AMGN', name:'Amgen',     logo:'💊', signal:'accumulation', level:'MAJOR',  volume:'4.2M',   volumeType:'normal', dailyDirection:-1, loadDiff1d:-2.96, hittingDays:2, perf5d:11.31,  perf10d:9.70,  sector:'صحة',     category:'change' },
  { ticker:'INTC', name:'Intel',     logo:'🔌', signal:'accumulation', level:'MAJOR',  volume:'52.3M',  volumeType:'high',   dailyDirection:-1, loadDiff1d:-1.45, hittingDays:2, perf5d:2.29,   perf10d:17.28, sector:'تكنولوجيا', category:'change' },
  { ticker:'ARM',  name:'ARM',       logo:'💪', signal:'accumulation', level:'MEDIUM', volume:'28.7M',  volumeType:'normal', dailyDirection:-1, loadDiff1d:-0.03, hittingDays:2, perf5d:19.52,  perf10d:11.09, sector:'تكنولوجيا', category:'change' },
];

const marketMakerData = { bidVolume: '28.5M', askVolume: '16.7M', netFlow: '+11.8M' };

const historyData = [
  { date: '2026-02-09', direction: -1, loadDiff: -1.92, level: 'MAJOR',  hittingDays: 3, perf5d: 2.29,  perf10d: 9.15 },
  { date: '2026-02-08', direction:  1, loadDiff:  0.45, level: 'MEDIUM', hittingDays: 2, perf5d: 3.12,  perf10d: 8.92 },
  { date: '2026-02-07', direction: -1, loadDiff: -0.82, level: 'LOW',    hittingDays: 3, perf5d: 2.85,  perf10d: 8.45 },
  { date: '2026-02-06', direction:  1, loadDiff:  1.25, level: 'HIGH',   hittingDays: 2, perf5d: 3.45,  perf10d: 7.89 },
  { date: '2026-02-05', direction:  1, loadDiff:  0.68, level: 'MEDIUM', hittingDays: 1, perf5d: 2.92,  perf10d: 7.12 },
  { date: '2026-02-04', direction: -1, loadDiff: -1.45, level: 'MAJOR',  hittingDays: 2, perf5d: 2.15,  perf10d: 6.78 },
];

/* ─── Base URL – change to 'http://localhost:8000' during local dev ─── */
/*
 * API_BASE: leave '' for production (same-origin).
 * For local dev with Vite on :5173 and FastAPI on :8000, either:
 *   a) set VITE_API_URL=http://localhost:8000 in your .env, OR
 *   b) add to vite.config.ts: server: { proxy: { '/api': 'http://localhost:8000' } }
 */
const API_BASE = 'https://app.qafah.com';

/* ══════════════════════════════════════════════════════════════════════
   PlotlyChart  –  fetches /api/chart/{ticker} and renders via Plotly
   ══════════════════════════════════════════════════════════════════════ */
function PlotlyChart({ ticker }: { ticker: string }) {
  const divRef   = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  /* inject Plotly CDN once */
  useEffect(() => {
    if (document.getElementById('plotly-cdn')) return;
    const s = document.createElement('script');
    s.id  = 'plotly-cdn';
    s.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
    document.head.appendChild(s);
  }, []);

const drawChart = useCallback(async (t: string) => {
  if (!t) return;
  setStatus('loading');
  setErrMsg('');
  const PlotlyGlobal = (window as any).Plotly;
  if (PlotlyGlobal && divRef.current) {
    PlotlyGlobal.purge(divRef.current);
  }

    // Wait for Plotly CDN
    let waited = 0;
    while (!(window as unknown as Record<string, unknown>).Plotly && waited < 6000) {
      await new Promise(r => setTimeout(r, 200));
      waited += 200;
    }
    const Plotly = (window as unknown as Record<string, unknown>).Plotly as Record<string, (...args: unknown[]) => void> | undefined;
    if (!Plotly) { setErrMsg('Plotly CDN failed to load – check network'); setStatus('error'); return; }

    try {
      const url = `${API_BASE}/api/chart/${encodeURIComponent(t)}`;
      const res = await fetch(url);

      // Read as text first – so we can show the real body when the server
      // returns HTML instead of JSON (wrong URL / CORS / crash).
      const raw = await res.text();

      if (!res.ok) {
        let detail = `HTTP ${res.status} ${res.statusText}`;
        try {
          const json = JSON.parse(raw);
          if (json.detail) detail = `${res.status}: ${json.detail}`;
        } catch {
          // Server returned HTML (wrong URL, CORS, server crash, etc.)
          const snippet = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250);
          detail = `${res.status} – got HTML not JSON. Snippet: "${snippet}"\n\nFix: check API_BASE, app.include_router(), and uvicorn logs.`;
        }
        throw new Error(detail);
      }

      // Parse the text we already have
      const d: ChartPayload = JSON.parse(raw);

      const traces = [
        // ── 1. Load (weight) line
        {
          x: d.dates, y: d.weight,
          name: 'Load', type: 'scatter', mode: 'lines',
          line: { color: '#2c3e50', width: 2.5 },
        },
        // ── 2. High (Window 3)
        {
          x: d.dates, y: d.high_3,
          name: 'High (Window 3)', type: 'scatter', mode: 'lines',
          line: { color: '#95a5a6', width: 1.5, dash: 'dot' },
        },
        // ── 3. Low (Window 3)
        {
          x: d.dates, y: d.low_3,
          name: 'Low (Window 3)', type: 'scatter', mode: 'lines',
          line: { color: '#95a5a6', width: 1.5, dash: 'dot' },
        },
        // ── 4. Positive Real Level (W4)
        {
          x: d.signals.positive_real.map(s => s.date),
          y: d.signals.positive_real.map(s => s.weight),
          text: d.signals.positive_real.map(s => String(s.level)),
          name: 'Positive Real Level (W4)', type: 'scatter', mode: 'markers+text',
          textposition: 'top center',
          marker: { size: 14, color: 'rgba(0, 255, 136, 0.3)', symbol: 'diamond', line: { width: 2, color: '#00cc70' } },
          textfont: { size: 13, color: '#00cc70', family: 'JetBrains Mono, monospace' },
          hovertemplate: 'Date: %{x}<br>Load: %{y:.4f}<br>Real Level: %{text}<extra></extra>',
        },
        // ── 5. Negative Real Level (W4)
        {
          x: d.signals.negative_real.map(s => s.date),
          y: d.signals.negative_real.map(s => s.weight),
          text: d.signals.negative_real.map(s => String(s.level)),
          name: 'Negative Real Level (W4)', type: 'scatter', mode: 'markers+text',
          textposition: 'top center',
          marker: { size: 14, color: 'rgba(255, 68, 102, 0.3)', symbol: 'diamond', line: { width: 2, color: '#e63946' } },
          textfont: { size: 13, color: '#e63946', family: 'JetBrains Mono, monospace' },
          hovertemplate: 'Date: %{x}<br>Load: %{y:.4f}<br>Real Level: %{text}<extra></extra>',
        },
        // ── 6. Positive Internal Level (W4)
        {
          x: d.signals.positive_internal.map(s => s.date),
          y: d.signals.positive_internal.map(s => s.weight),
          text: d.signals.positive_internal.map(s => String(s.level)),
          name: 'Positive Internal Level (W4)', type: 'scatter', mode: 'markers+text',
          textposition: 'bottom center',
          marker: { size: 11, color: 'rgba(0, 212, 255, 0.3)', symbol: 'circle', line: { width: 2, color: '#0096c7' } },
          textfont: { size: 12, color: '#0096c7', family: 'JetBrains Mono, monospace' },
          hovertemplate: 'Date: %{x}<br>Load: %{y:.4f}<br>Internal Level: %{text}<extra></extra>',
        },
        // ── 7. Negative Internal Level (W4)
        {
          x: d.signals.negative_internal.map(s => s.date),
          y: d.signals.negative_internal.map(s => s.weight),
          text: d.signals.negative_internal.map(s => String(s.level)),
          name: 'Negative Internal Level (W4)', type: 'scatter', mode: 'markers+text',
          textposition: 'bottom center',
          marker: { size: 11, color: 'rgba(255, 149, 0, 0.3)', symbol: 'circle', line: { width: 2, color: '#d97706' } },
          textfont: { size: 12, color: '#d97706', family: 'JetBrains Mono, monospace' },
          hovertemplate: 'Date: %{x}<br>Load: %{y:.4f}<br>Internal Level: %{text}<extra></extra>',
        },
      ];

      const layout = {
        // No title – ticker info already shown in the React card header above
        margin: { t: 20, b: 130, l: 60, r: 20 },
        xaxis: { title: 'Date', gridcolor: 'rgba(0, 0, 0, 0.1)', color: '#1e293b' },
        yaxis: { title: '', gridcolor: 'rgba(0, 0, 0, 0.1)', color: '#1e293b' },
        hovermode: 'x unified',
        showlegend: true,
        legend: {
          orientation: 'h',   // horizontal so it fits in width
          x: 0,               // align to left edge
          y: -0.28,           // push below x-axis
          xanchor: 'left',
          yanchor: 'top',
          font: { size: 11, color: '#1e293b' },
          bgcolor: 'rgba(255,255,255,0)',
          borderwidth: 0,
        },
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#f8fafc',
        height: 520,
      };

      Plotly.react(divRef.current, traces, layout, { responsive: true });
      setStatus('idle');
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, []);

  useEffect(() => { drawChart(ticker); }, [ticker, drawChart]);

  return (
<div className="relative" style={{ minHeight: 520 }}>
  {status === 'loading' && (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 rounded-xl z-10">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      <span className="mr-3 text-sm text-slate-500">جاري تحميل البيانات…</span>
    </div>
  )}
  {status === 'error' && (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50/95 rounded-xl z-10 p-5 overflow-auto">
      <AlertCircle className="w-10 h-10 text-red-400 shrink-0" />
      <pre className="text-xs text-red-500 font-mono whitespace-pre-wrap text-center max-w-full break-words">
        {errMsg}
      </pre>
      <button onClick={() => drawChart(ticker)} className="text-xs underline text-slate-500 hover:text-slate-800 mt-1">
        إعادة المحاولة
      </button>
    </div>
  )}
  {/* ✅ Always visible — no opacity toggle */}
  <div ref={divRef} />
</div>
  );
}

/* ─── helper badges ───────────────────────────────────────────────────── */
const SignalBadge = ({ signal }: { signal: string }) =>
  signal === 'accumulation'
    ? <Badge className="bg-emerald-500 text-white border-0 text-xs"><TrendingUp className="w-3 h-3 ml-1" />تجميع</Badge>
    : <Badge className="bg-red-500 text-white border-0 text-xs"><TrendingDown className="w-3 h-3 ml-1" />تصريف</Badge>;

const VolumeBadge = ({ volumeType }: { volumeType: string }) =>
  volumeType === 'high'
    ? <Badge className="bg-purple-100 text-purple-700 text-xs">عالي</Badge>
    : <Badge className="bg-slate-100 text-slate-600 text-xs">طبيعي</Badge>;

/* ═══════════════════════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════════════════════ */
export function CompaniesAccumulationPage() {
  const [selectedCategory, setSelectedCategory] = useState<'continuous' | 'sub' | 'change'>('continuous');
  const [selectedCompany,  setSelectedCompany]  = useState<CompanyData>(companiesData[0]);
  const [searchQuery,      setSearchQuery]       = useState('');

  const filteredCompanies = companiesData
    .filter(c => c.category === selectedCategory)
    .filter(c =>
      !searchQuery ||
      c.ticker.includes(searchQuery.toUpperCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const categoryMeta = {
    continuous: { color: 'bg-purple-600', icon: <RefreshCw className="w-4 h-4 ml-2" />, label: 'استمراري' },
    sub:        { color: 'bg-blue-600',   icon: <Activity    className="w-4 h-4 ml-2" />, label: 'فرعي' },
    change:     { color: 'bg-orange-600', icon: <ArrowUpDown className="w-4 h-4 ml-2" />, label: 'تغيير اتجاه' },
  } as const;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <ArrowRightLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="text-lg font-bold tracking-tight text-slate-800">قافة</span>
            </div>
            <div className="flex items-center gap-5 text-sm text-slate-500">
              <span>فاحص السوق</span>
              <span className="text-slate-300">|</span>
              <span>آخر تحديث: 09 فبراير</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Category tabs ─────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['continuous', 'sub', 'change'] as const).map(cat => {
            const m  = categoryMeta[cat];
            const ac = selectedCategory === cat;
            return (
              <Button
                key={cat}
                variant={ac ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={`transition-all ${ac ? m.color + ' text-white' : 'hover:bg-slate-100'}`}
              >
                {m.icon}
                {m.label}
                <Badge className={`mr-2 text-xs ${ac ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {companiesData.filter(c => c.category === cat).length}
                </Badge>
              </Button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: Chart + History table ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Chart card */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-5">

                {/* ticker header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shadow">
                      {selectedCompany.logo}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedCompany.ticker} — {selectedCompany.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <SignalBadge signal={selectedCompany.signal} />
                        <Badge className="bg-slate-100 text-slate-600 text-xs">{selectedCompany.level}</Badge>
                        <span className="text-xs text-slate-400">{selectedCompany.sector}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">$228.45</p>
                    <p className={`text-sm font-semibold ${selectedCompany.dailyDirection > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {selectedCompany.dailyDirection > 0 ? '+' : ''}{selectedCompany.loadDiff1d.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* ── LIVE PLOTLY CHART from /api/chart/{ticker} ─── */}
                <div className="overflow-hidden rounded-lg">
                  <PlotlyChart ticker={selectedCompany.ticker} />
                </div>

                {/* market maker stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'حجم الشراء',    val: marketMakerData.bidVolume, bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
                    { label: 'حجم البيع',     val: marketMakerData.askVolume, bg: 'bg-red-50 border-red-100',         text: 'text-red-600'     },
                    { label: 'التدفق الصافي', val: marketMakerData.netFlow,   bg: 'bg-purple-50 border-purple-100',   text: 'text-purple-600'  },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} border rounded-xl p-3 text-center`}>
                      <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                      <p className={`font-bold ${s.text}`}>{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* action buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'شراء',        icon: <ShoppingCart className="w-4 h-4 ml-1" />, cls: 'bg-emerald-600 hover:bg-emerald-700' },
                    { label: 'بيع',          icon: <TrendingDown  className="w-4 h-4 ml-1" />, cls: 'bg-red-600 hover:bg-red-700'         },
                    { label: 'إعادة شراء',  icon: <RotateCcw     className="w-4 h-4 ml-1" />, cls: 'bg-blue-600 hover:bg-blue-700'       },
                    { label: 'تغيير العقد', icon: <Plus          className="w-4 h-4 ml-1" />, cls: 'bg-purple-600 hover:bg-purple-700'   },
                  ].map(btn => (
                    <Button key={btn.label} className={`text-white text-sm ${btn.cls}`}>
                      {btn.icon}{btn.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── جدول الكميات السابقة ─────────────────────────────── */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-slate-500">📅</span>
                  جدول الكميات السابقة
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 rounded-lg">
                        <th className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">التاريخ</th>
                        <th className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">الاتجاه</th>
                        <th className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">الحمل</th>
                        <th className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">المستوى</th>
                        <th className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">أيام</th>
                        <th className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">5 أيام</th>
                        <th className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">10 أيام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 text-slate-700 font-mono text-xs">{row.date}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1 font-semibold ${row.direction > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {row.direction > 0 ? '↑' : '↓'} {row.direction > 0 ? '+' : ''}{row.direction}
                            </span>
                          </td>
                          <td className={`py-2.5 px-3 font-medium ${row.loadDiff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {row.loadDiff >= 0 ? '+' : ''}{row.loadDiff.toFixed(2)}%
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge className="bg-slate-100 text-slate-600 text-xs font-mono">{row.level}</Badge>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-xs">{row.hittingDays}</td>
                          <td className={`py-2.5 px-3 font-medium ${row.perf5d >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {row.perf5d >= 0 ? '+' : ''}{row.perf5d.toFixed(2)}%
                          </td>
                          <td className={`py-2.5 px-3 font-medium ${row.perf10d >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {row.perf10d >= 0 ? '+' : ''}{row.perf10d.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Company list ────────────────────────────────── */}
          <div className="space-y-2">
            {/* search */}
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث عن شركة..."
                className="w-full pr-9 pl-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-slate-400"
              />
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
              قائمة الشركات ({filteredCompanies.length})
            </p>

            {filteredCompanies.map(company => (
              <Card
                key={company.ticker}
                onClick={() => setSelectedCompany(company)}
                className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedCompany.ticker === company.ticker
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : company.signal === 'accumulation'
                      ? 'border-emerald-100 hover:border-emerald-300'
                      : 'border-red-100 hover:border-red-300'
                }`}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg shrink-0">
                      {company.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-900 text-sm">{company.ticker}</span>
                        <SignalBadge signal={company.signal} />
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-1.5">{company.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        <Badge className="bg-slate-100 text-slate-600 text-xs">{company.level}</Badge>
                        <VolumeBadge volumeType={company.volumeType} />
                        <span className="text-xs text-slate-400">{company.volume}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${company.perf5d  >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          5d {company.perf5d  > 0 ? '+' : ''}{company.perf5d.toFixed(1)}%
                        </span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${company.perf10d >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          10d {company.perf10d > 0 ? '+' : ''}{company.perf10d.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredCompanies.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}