import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, TrendingUp, Bell, BarChart2, Clock } from 'lucide-react';

const BASE = 'https://app.qafah.com';
const TICKER = 'NVDA';

const INTERVALS = [
  { label: '1m',  period: '1m',  limit: 120 },
  { label: '5m',  period: '5m',  limit: 100 },
  { label: '15m', period: '15m', limit: 100 },
  { label: '1h',  period: '1h',  limit: 100 },
  { label: '4h',  period: '4h',  limit: 100 },
  { label: '1d',  period: '1d',  limit: 60  },
];

const fmt = (v, d = 2) =>
  v == null || isNaN(Number(v)) ? '—' : Number(v).toFixed(d);

async function apiFetch(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

// Loads LightweightCharts v5 from unpkg and resolves with the LWC namespace
function loadLWC() {
  return new Promise((resolve) => {
    if (window.LightweightCharts) return resolve(window.LightweightCharts);
    const existing = document.getElementById('lwc-script');
    if (existing) {
      const poll = setInterval(() => {
        if (window.LightweightCharts) { clearInterval(poll); resolve(window.LightweightCharts); }
      }, 30);
      return;
    }
    const s = document.createElement('script');
    s.id  = 'lwc-script';
    s.src = 'https://unpkg.com/lightweight-charts@5.0.7/dist/lightweight-charts.standalone.production.js';
    s.onload = () => resolve(window.LightweightCharts);
    document.head.appendChild(s);
  });
}

// ── Candlestick chart ─────────────────────────────────────────────────────────
function CandlestickChart({ ohlc, loading }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const seriesRef    = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loadLWC().then((LWC) => {
      if (cancelled || !containerRef.current) return;

      const chart = LWC.createChart(containerRef.current, {
        width:  containerRef.current.clientWidth,
        height: 360,
        layout: {
          background: { type: 'solid', color: '#0a0f1e' },
          textColor:  '#94a3b8',
        },
        grid: {
          vertLines: { color: '#1e293b' },
          horzLines: { color: '#1e293b' },
        },
        crosshair: {
          mode: 1,
          vertLine: { color: '#3b82f6', width: 1, style: 1 },
          horzLine: { color: '#3b82f6', width: 1, style: 1 },
        },
        rightPriceScale: { borderColor: '#1e293b' },
        timeScale: {
          borderColor:    '#1e293b',
          timeVisible:    true,
          secondsVisible: false,
          rightOffset:    4,
          barSpacing:     8,
        },
      });

      // ✅ v5 API: addSeries(SeriesType, options)
      const series = chart.addSeries(LWC.CandlestickSeries, {
        upColor:         '#10b981',
        downColor:       '#ef4444',
        borderUpColor:   '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor:     '#10b981',
        wickDownColor:   '#ef4444',
      });

      chartRef.current  = chart;
      seriesRef.current = series;

      const ro = new ResizeObserver(() => {
        chartRef.current?.applyOptions({ width: containerRef.current?.clientWidth ?? 600 });
      });
      ro.observe(containerRef.current);
      containerRef.current._ro = ro;
    });

    return () => {
      cancelled = true;
      containerRef.current?._ro?.disconnect();
      chartRef.current?.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  }, []);

  // Update chart data when ohlc changes
  useEffect(() => {
    if (!seriesRef.current || !ohlc?.length) return;

    const candles = ohlc
      .map(b => ({
        time:  typeof b.time === 'number' ? b.time : Math.floor(new Date(b.time).getTime() / 1000),
        open:  +b.open,
        high:  +b.high,
        low:   +b.low,
        close: +b.close,
      }))
      .filter(b => b.time && !isNaN(b.open))
      .sort((a, b) => a.time - b.time);

    seriesRef.current.setData(candles);
    chartRef.current?.timeScale().fitContent();
  }, [ohlc]);

  return (
    <div className="relative">
      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(10,15,30,0.75)' }}
        >
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      )}
      <div ref={containerRef} className="w-full rounded-xl overflow-hidden" style={{ minHeight: 360 }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AAPLDetailPage() {
  const [signal,       setSignal]       = useState(null);
  const [detail,       setDetail]       = useState(null);
  const [ohlc,         setOhlc]         = useState([]);
  const [activeIv,     setActiveIv]     = useState(INTERVALS.find(i => i.label === '1d'));
  const [loading,      setLoading]      = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error,        setError]        = useState(null);

  const fetchMeta = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [signals, alerts, positions] = await Promise.all([
        apiFetch(`/api/ticker_resell_signals?mode=cached`),
        apiFetch(`/api/t_alerts?ticker=${TICKER}`),
        apiFetch(`/positions?ticker=${TICKER}&limit=10`),
      ]);
      setSignal(Array.isArray(signals) ? signals.find(s => s.holding_ticker === TICKER) ?? null : null);
      setDetail({ alerts, positions });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const fetchOhlc = useCallback(async (iv) => {
    setChartLoading(true);
    try {
      const data = await apiFetch(`/api/ohlc?ticker=${TICKER}&period=${iv.period}&limit=${iv.limit}`);
      setOhlc(Array.isArray(data) ? data : []);
    } catch { setOhlc([]); }
    finally { setChartLoading(false); }
  }, []);

  useEffect(() => { fetchMeta(); }, []);
  useEffect(() => { fetchOhlc(activeIv); }, [activeIv]);

  return (
    <div
      className="min-h-screen text-slate-100"
      dir="rtl"
      style={{
        background: 'linear-gradient(135deg,#070d1a 0%,#0f172a 60%,#070d1a 100%)',
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-5 py-3 flex items-center gap-4">
          <BarChart2 className="w-5 h-5 text-blue-400" />
          <span className="font-semibold tracking-widest text-sm">{TICKER}</span>
          <span className="text-xs text-slate-500">إشارات إعادة البيع</span>
          <button
            onClick={() => { fetchMeta(); fetchOhlc(activeIv); }}
            disabled={loading}
            className="mr-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> تحديث
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-700/40 px-4 py-3 text-xs text-red-400">
            خطأ: {error}
          </div>
        )}

        {/* Chart card */}
        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              الرسم البياني — {TICKER}
            </span>
            <div className="flex gap-1 flex-wrap">
              {INTERVALS.map(iv => (
                <button
                  key={iv.label}
                  onClick={() => setActiveIv(iv)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                    activeIv.label === iv.label
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-700/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </div>
          <CandlestickChart ohlc={ohlc} loading={chartLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Signal Fields */}
          {signal && (
            <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 shadow-xl">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-blue-400" /> بيانات الإشارة
              </h2>
              <div className="grid grid-cols-2 gap-x-6 text-xs">
                {Object.entries(signal).filter(([k]) => k !== 'holding_ticker').map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-dashed border-slate-700/40 py-2">
                    <span className="text-slate-500 truncate">{k}</span>
                    <span className="font-medium text-slate-200 ml-2">
                      {typeof v === 'number' ? fmt(v, 4) : String(v ?? '—')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Position Changes */}
          {detail?.positions?.length > 0 && (
            <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 shadow-xl">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> تغييرات المركز
              </h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700/40 text-slate-500">
                    <th className="pb-2 text-right font-medium">الإطار</th>
                    <th className="pb-2 text-right font-medium">القديم</th>
                    <th className="pb-2 text-right font-medium">الجديد</th>
                    <th className="pb-2 text-right font-medium">الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.positions.map((p, i) => (
                    <tr key={i} className="border-t border-slate-800">
                      <td className="py-2 font-mono text-slate-300">{p.frames}</td>
                      <td className="py-2 text-slate-500">{p.P_OLD || '—'}</td>
                      <td className="py-2 font-semibold text-blue-400">{p.P_NEW}</td>
                      <td className="py-2 text-slate-500 whitespace-nowrap">
                        {new Date(p.datetime).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Telegram Alerts */}
          <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 shadow-xl lg:col-span-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-amber-400" /> تنبيهات تيليغرام
            </h2>
            {!detail?.alerts?.length ? (
              <p className="text-xs text-slate-500">لا توجد تنبيهات</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto pl-1">
                {detail.alerts.map((a, i) => (
                  <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/60 px-4 py-3 text-xs">
                    <div className="flex justify-between mb-2 gap-2 flex-wrap">
                      <span className="font-semibold text-slate-200">{a.filter} — {a.frame}</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(a.datetime).toLocaleString('ar-EG')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-slate-400">
                      <span>السعر: <b className="text-slate-200">{fmt(a.close_price)}</b></span>
                      {a.tp1    != null && <span>TP1: <b className="text-emerald-400">{fmt(a.tp1, 5)}</b></span>}
                      {a.tp2    != null && <span>TP2: <b className="text-emerald-500">{fmt(a.tp2, 5)}</b></span>}
                      {a.target != null && <span>Target: <b className="text-slate-300">{a.target}</b></span>}
                      {a.ric    && <span className="text-amber-400 font-semibold">RIC</span>}
                      <span className="text-slate-600">Bot: {a.bot}</span>
                      {a.ticketno != null && <span className="text-slate-600">#{a.ticketno}</span>}
                    </div>
                    {a.details && <p className="mt-2 text-slate-500">{a.details}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {loading && !signal && (
          <div className="flex flex-col items-center gap-3 py-24 text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin text-blue-500" />
            <span className="text-xs tracking-widest">جارٍ التحميل…</span>
          </div>
        )}
      </main>
    </div>
  );
}