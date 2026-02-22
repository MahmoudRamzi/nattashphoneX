import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ticker: string;
  signal: 'accumulation' | 'distribution';
  level: string;        // "MAJOR" | "MEDIUM" | "LOW"
  volume: string;       // e.g. "45.2M"
  volumeType: 'high' | 'normal';
  dailyDirection: number;
  loadDiff1d: number;
  hittingDays: number;
  perf5d: number;
  perf10d: number;
  category: 'continuous' | 'sub' | 'change';
}

interface SignalsPayload {
  continuous: CompanyData[];
  sub:        CompanyData[];
  change:     CompanyData[];
  date:       string;
}

interface SignalPoint { date: string; weight: number; level: number }

interface ChartPayload {
  ticker: string; window: number;
  dates: string[]; weight: number[];
  high_3: number[]; low_3: number[];
  high_4: number[]; low_4: number[];
  signals: {
    positive_real:     SignalPoint[];
    negative_real:     SignalPoint[];
    positive_internal: SignalPoint[];
    negative_internal: SignalPoint[];
  };
}

interface HistoryRow {
  date: string; direction: number; loadDiff: number;
  level: string; hittingDays: number; perf5d: number; perf10d: number;
}

interface StockStats {
  bidVolume:  string;
  askVolume:  string;
  netFlow:    string;
  loading: boolean;
}

/* ─── config ─────────────────────────────────────────────────────────── */
const API_BASE = 'https://app.qafah.com';

/* ─── Ticker logo  (static file at /{ticker}.png) ───────────────────── */
function TickerLogo({ ticker, size = 'md' }: { ticker: string; size?: 'sm' | 'md' }) {
  const [err, setErr] = React.useState(false);
  const dim = size === 'sm' ? 'w-10 h-10 rounded-lg text-xs' : 'w-12 h-12 rounded-xl text-sm';
  return (
    <div className={`${dim} bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden shadow`}>
      {!err
        ? <img
            src={`${API_BASE}/static/logos_tickers/${ticker}.png`}
            alt={ticker}
            className="w-full h-full object-contain"
            onError={() => setErr(true)}
          />
        : <span className="text-white font-bold">{ticker.slice(0, 3)}</span>
      }
    </div>
  );
}

/* ─── useStockStats: fetches real bid/ask/flow/earnings via /api/stock_stats ── */
function useStockStats(ticker: string | undefined): StockStats {
  const [stats, setStats] = React.useState<StockStats>({
    bidVolume: '…', askVolume: '…', netFlow: '…', loading: true,
  });

  React.useEffect(() => {
    if (!ticker) return;
    setStats(s => ({ ...s, loading: true, bidVolume: '…', askVolume: '…', netFlow: '…' }));
    fetch(`${API_BASE}/api/stock_stats/${encodeURIComponent(ticker)}`)
      .then(r => r.json())
      .then((d: { bid_volume: string; ask_volume: string; net_flow: string }) => {
        setStats({
          bidVolume: d.bid_volume ?? '—',
          askVolume: d.ask_volume ?? '—',
          netFlow:   d.net_flow   ?? '—',
          loading: false,
        });
      })
      .catch(() => {
        setStats({ bidVolume: '—', askVolume: '—', netFlow: '—', loading: false });
      });
  }, [ticker]);

  return stats;
}

/* ══════════════════════════════════════════════════════════════════════
   PlotlyChart  –  fetches /api/chart/{ticker} and renders via Plotly
   ══════════════════════════════════════════════════════════════════════ */
function PlotlyChart({ ticker }: { ticker: string }) {
  const divRef = useRef<HTMLDivElement>(null);
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

    const PlotlyGlobal = (window as any).Plotly; // eslint-disable-line
    if (PlotlyGlobal && divRef.current) PlotlyGlobal.purge(divRef.current);

    let waited = 0;
    while (!(window as unknown as Record<string, unknown>).Plotly && waited < 6000) {
      await new Promise(r => setTimeout(r, 200));
      waited += 200;
    }
    const Plotly = (window as unknown as Record<string, unknown>).Plotly as
      Record<string, (...args: unknown[]) => void> | undefined;
    if (!Plotly) { setErrMsg('Plotly CDN failed to load – check network'); setStatus('error'); return; }

    try {
      const url = `${API_BASE}/api/chart/${encodeURIComponent(t)}`;
      const res = await fetch(url);
      const raw = await res.text();

      if (!res.ok) {
        let detail = `HTTP ${res.status} ${res.statusText}`;
        try {
          const json = JSON.parse(raw);
          if (json.detail) detail = `${res.status}: ${json.detail}`;
        } catch {
          const snippet = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250);
          detail = `${res.status} – got HTML not JSON. Snippet: "${snippet}"\n\nFix: check API_BASE, app.include_router(), and uvicorn logs.`;
        }
        throw new Error(detail);
      }

      const d: ChartPayload = JSON.parse(raw);

      const traces = [
        // ── 1. Load (weight) line
        { x: d.dates, y: d.weight,
          name: 'Load', type: 'scatter', mode: 'lines',
          line: { color: '#2c3e50', width: 2.5 } },
        // ── 2. High (Window 3)
        { x: d.dates, y: d.high_3,
          name: 'High (Window 3)', type: 'scatter', mode: 'lines',
          line: { color: '#95a5a6', width: 1.5, dash: 'dot' } },
        // ── 3. Low (Window 3)
        { x: d.dates, y: d.low_3,
          name: 'Low (Window 3)', type: 'scatter', mode: 'lines',
          line: { color: '#95a5a6', width: 1.5, dash: 'dot' } },
        // ── 4. Positive Real Level (W4)
        { x: d.signals.positive_real.map(s => s.date),
          y: d.signals.positive_real.map(s => s.weight),
          text: d.signals.positive_real.map(s => String(s.level)),
          name: 'Positive Real Level (W4)', type: 'scatter', mode: 'markers+text',
          textposition: 'top center',
          marker: { size: 14, color: 'rgba(0, 255, 136, 0.3)', symbol: 'diamond', line: { width: 2, color: '#00cc70' } },
          textfont: { size: 13, color: '#00cc70', family: 'JetBrains Mono, monospace' },
          hovertemplate: 'Date: %{x}<br>Load: %{y:.4f}<br>Real Level: %{text}<extra></extra>' },
        // ── 5. Negative Real Level (W4)
        { x: d.signals.negative_real.map(s => s.date),
          y: d.signals.negative_real.map(s => s.weight),
          text: d.signals.negative_real.map(s => String(s.level)),
          name: 'Negative Real Level (W4)', type: 'scatter', mode: 'markers+text',
          textposition: 'top center',
          marker: { size: 14, color: 'rgba(255, 68, 102, 0.3)', symbol: 'diamond', line: { width: 2, color: '#e63946' } },
          textfont: { size: 13, color: '#e63946', family: 'JetBrains Mono, monospace' },
          hovertemplate: 'Date: %{x}<br>Load: %{y:.4f}<br>Real Level: %{text}<extra></extra>' },
        // ── 6. Positive Internal Level (W4)
        { x: d.signals.positive_internal.map(s => s.date),
          y: d.signals.positive_internal.map(s => s.weight),
          text: d.signals.positive_internal.map(s => String(s.level)),
          name: 'Positive Internal Level (W4)', type: 'scatter', mode: 'markers+text',
          textposition: 'bottom center',
          marker: { size: 11, color: 'rgba(0, 212, 255, 0.3)', symbol: 'circle', line: { width: 2, color: '#0096c7' } },
          textfont: { size: 12, color: '#0096c7', family: 'JetBrains Mono, monospace' },
          hovertemplate: 'Date: %{x}<br>Load: %{y:.4f}<br>Internal Level: %{text}<extra></extra>' },
        // ── 7. Negative Internal Level (W4)
        { x: d.signals.negative_internal.map(s => s.date),
          y: d.signals.negative_internal.map(s => s.weight),
          text: d.signals.negative_internal.map(s => String(s.level)),
          name: 'Negative Internal Level (W4)', type: 'scatter', mode: 'markers+text',
          textposition: 'bottom center',
          marker: { size: 11, color: 'rgba(255, 149, 0, 0.3)', symbol: 'circle', line: { width: 2, color: '#d97706' } },
          textfont: { size: 12, color: '#d97706', family: 'JetBrains Mono, monospace' },
          hovertemplate: 'Date: %{x}<br>Load: %{y:.4f}<br>Internal Level: %{text}<extra></extra>' },
      ];

      const layout = {
        margin: { t: 20, b: 130, l: 60, r: 20 },
        xaxis: { title: 'Date', gridcolor: 'rgba(0, 0, 0, 0.1)', color: '#1e293b' },
        yaxis: { title: '',     gridcolor: 'rgba(0, 0, 0, 0.1)', color: '#1e293b' },
        hovermode: 'x unified',
        showlegend: true,
        legend: {
          orientation: 'h', x: 0, y: -0.28,
          xanchor: 'left', yanchor: 'top',
          font: { size: 11, color: '#1e293b' },
          bgcolor: 'rgba(255,255,255,0)', borderwidth: 0,
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

/* ─── History table ──────────────────────────────────────────────────── */
function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  if (!rows.length) return (
    <p className="text-slate-400 text-sm text-center py-6">لا توجد بيانات سابقة</p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 rounded-lg">
            {['التاريخ', 'الاتجاه', 'الحمل', 'المستوى', 'أيام', '5 أيام', '10 أيام'].map(h => (
              <th key={h} className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
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
  );
}

/* ─── Mock history data ──────────────────────────────────────────────── */
const MOCK_HISTORY: HistoryRow[] = [
  { date: '2026-02-09', direction: -1, loadDiff: -1.92, level: 'MAJOR',  hittingDays: 3, perf5d: 2.29,  perf10d: 9.15 },
  { date: '2026-02-08', direction:  1, loadDiff:  0.45, level: 'MEDIUM', hittingDays: 2, perf5d: 3.12,  perf10d: 8.92 },
  { date: '2026-02-07', direction: -1, loadDiff: -0.82, level: 'LOW',    hittingDays: 3, perf5d: 2.85,  perf10d: 8.45 },
  { date: '2026-02-06', direction:  1, loadDiff:  1.25, level: 'HIGH',   hittingDays: 2, perf5d: 3.45,  perf10d: 7.89 },
  { date: '2026-02-05', direction:  1, loadDiff:  0.68, level: 'MEDIUM', hittingDays: 1, perf5d: 2.92,  perf10d: 7.12 },
  { date: '2026-02-04', direction: -1, loadDiff: -1.45, level: 'MAJOR',  hittingDays: 2, perf5d: 2.15,  perf10d: 6.78 },
];

/* ═══════════════════════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════════════════════ */
export function CompaniesAccumulationPage() {
  const [selectedCategory, setSelectedCategory] = useState<'continuous' | 'sub' | 'change'>('continuous');
  const [selectedCompany,  setSelectedCompany]  = useState<CompanyData | null>(null);
  const [searchQuery,      setSearchQuery]       = useState('');

  // Live data from /api/signals
  const [signals,     setSignals]     = useState<SignalsPayload | null>(null);
  const [sigsLoading, setSigsLoading] = useState(true);
  const [sigsError,   setSigsError]   = useState('');

  // History rows — static mock data
  const historyRows: HistoryRow[] = MOCK_HISTORY;

  // Live stock stats (bid/ask volume, net flow, next earnings)
  const stockStats = useStockStats(selectedCompany?.ticker);

  // ── Fetch /api/signals once on mount ─────────────────────────────────
  useEffect(() => {
    setSigsLoading(true);
    fetch(`${API_BASE}/api/signals`)
      .then(r => r.text())
      .then(raw => {
        try {
          const data: SignalsPayload = JSON.parse(raw);
          setSignals(data);
          // auto-select first company in the default tab
          const first = data.continuous?.[0] ?? data.sub?.[0] ?? data.change?.[0] ?? null;
          setSelectedCompany(first ? { ...first, category: 'continuous' } : null);
        } catch {
          setSigsError('فشل في تحليل استجابة /api/signals');
        }
      })
      .catch(e => setSigsError(String(e)))
      .finally(() => setSigsLoading(false));
  }, []);

  // Auto-select first company when category tab changes
  useEffect(() => {
    if (!signals) return;
    const first = signals[selectedCategory]?.[0] ?? null;
    setSelectedCompany(first ? { ...first, category: selectedCategory } : null);
  }, [selectedCategory, signals]);

  // ── Filtered company list ─────────────────────────────────────────────
  const allInCategory: CompanyData[] = signals
    ? (signals[selectedCategory] ?? []).map(c => ({ ...c, category: selectedCategory }))
    : [];

  const filteredCompanies = allInCategory.filter(c =>
    !searchQuery || c.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const counts = signals
    ? { continuous: signals.continuous.length, sub: signals.sub.length, change: signals.change.length }
    : { continuous: 0, sub: 0, change: 0 };

  const categoryMeta = {
    continuous: { color: 'bg-purple-600', icon: <RefreshCw  className="w-4 h-4 ml-2" />, label: 'استمراري'    },
    sub:        { color: 'bg-blue-600',   icon: <Activity    className="w-4 h-4 ml-2" />, label: 'فرعي'        },
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
              <span>آخر تحديث: {signals?.date ?? '…'}</span>
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
                  {sigsLoading ? '…' : counts[cat]}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* ── Error banner ─────────────────────────────────────────── */}
        {sigsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            فشل تحميل البيانات: {sigsError}
          </div>
        )}

        {/* ltr wrapper → col-span-2 stays LEFT even inside dir=rtl */}
        <div dir="ltr" className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: Chart + History ────────────────────────────────── */}
          <div dir="rtl" className="lg:col-span-2 space-y-6">

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-5">

                {/* Ticker header */}
                {selectedCompany ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TickerLogo ticker={selectedCompany.ticker} />
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{selectedCompany.ticker}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <SignalBadge signal={selectedCompany.signal} />
                          <Badge className="bg-slate-100 text-slate-600 text-xs">{selectedCompany.level}</Badge>
                          <VolumeBadge volumeType={selectedCompany.volumeType} />
                          <span className="text-xs text-slate-400">{selectedCompany.volume}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${selectedCompany.loadDiff1d >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {selectedCompany.loadDiff1d >= 0 ? '+' : ''}{selectedCompany.loadDiff1d.toFixed(2)}%
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">تغيير يومي في الحمل</p>
                    </div>
                  </div>
                ) : (
                  /* skeleton while loading */
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="w-20 h-3 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                )}

                {/* Plotly chart */}
                {selectedCompany
                  ? <PlotlyChart ticker={selectedCompany.ticker} />
                  : <div className="flex items-center justify-center h-[520px] bg-slate-50 rounded-xl text-slate-400 text-sm">
                      {sigsLoading
                        ? <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                        : 'اختر شركة من القائمة'}
                    </div>
                }

                {/* Live market stats from yfinance */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'حجم الشراء',    val: stockStats.bidVolume, bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
                    { label: 'حجم البيع',     val: stockStats.askVolume, bg: 'bg-red-50 border-red-100',         text: 'text-red-600'     },
                    { label: 'التدفق الصافي', val: stockStats.netFlow,   bg: 'bg-purple-50 border-purple-100',   text: 'text-purple-600'  },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} border rounded-xl p-3 text-center`}>
                      <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                      <p className={`font-bold text-sm ${s.text} ${stockStats.loading ? 'animate-pulse' : ''}`}>
                        {s.val}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
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

            {/* ── جدول الكميات السابقة ──────────────────────────────── */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-slate-500">📅</span>
                  جدول الكميات السابقة
                </h3>
                <HistoryTable rows={historyRows} />
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Company list ──────────────────────────────────── */}
          <div dir="rtl" className="flex flex-col" style={{ maxHeight: 'calc(100vh - 160px)', position: 'sticky', top: '76px' }}>

            {/* Search */}
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
              قائمة الشركات ({sigsLoading ? '…' : filteredCompanies.length})
            </p>

            {/* Scrollable list */}
            <div className="overflow-y-auto flex-1 space-y-2 pl-0.5 pr-0.5" style={{ scrollbarWidth: 'thin' }}>

            {/* Loading skeletons */}
            {sigsLoading && [1, 2, 3].map(i => (
              <Card key={i} className="border-slate-100">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-slate-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Company cards */}
            {!sigsLoading && filteredCompanies.map(company => (
              <Card
                key={company.ticker}
                onClick={() => setSelectedCompany({ ...company, category: selectedCategory })}
                className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedCompany?.ticker === company.ticker
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : company.signal === 'accumulation'
                      ? 'border-emerald-100 hover:border-emerald-300'
                      : 'border-red-100 hover:border-red-300'
                }`}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    <TickerLogo ticker={company.ticker} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-900 text-sm">{company.ticker}</span>
                        <SignalBadge signal={company.signal} />
                      </div>
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

            {!sigsLoading && filteredCompanies.length === 0 && !sigsError && (
              <div className="text-center text-slate-400 text-sm py-8">لا توجد نتائج</div>
            )}
            </div>{/* end scrollable */}
          </div>
        </div>
      </main>
    </div>
  );
}