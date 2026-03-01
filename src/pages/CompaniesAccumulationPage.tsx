import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, RefreshCw, ArrowRightLeft,
  ShoppingCart, RotateCcw, Plus, Activity, ArrowUpDown,
  AlertCircle, Loader2, Search,
} from 'lucide-react';
import QafahLogo from '@/components/Qafah_logo';

/* ─── types ─────────────────────────────────────────────────────────── */

/**
 * Raw row from GET /api/ticker_resell_signals
 * (only the fields we actually consume)
 */
interface RawRow {
  holding_ticker: string;
  date: string;
  load: number;
  load_level_state: 'accumulation' | 'distribution' | 'pre-accumulation' | 'pre-distribution' | 'neutral';
  level_type: 'continuous' | 'secondary_change' | 'direction_change' | 'none';
  DiffCategory_1d: string;
  load_direction: number;
  LoadChangePerc_5d: string;
  LoadChangePerc_3d: string;
  high_3: number;
  low_3: number;
  high_4: number;
  low_4: number;
  close: number;
  resell_signal_4: boolean;
  resell_counter_4: number;
  resell_internal_signal_4: boolean;
  resell_internal_4: number;
}

interface CompanyData {
  ticker: string;
  signal: 'accumulation' | 'distribution' | 'pre-accumulation' | 'pre-distribution' | 'neutral';
  levelType: 'continuous' | 'secondary_change' | 'direction_change' | 'none';
  diffCategory: string;
  load: number;
  loadDirection: number;
  perf5d: string;
  perf3d: string;
  date: string;
}

interface HistoryRow {
  date: string;
  direction: number;
  load: number;
  level: string;
  perf5d: string;
  perf3d: string;
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

interface StockStats {
  bidVolume: string;
  askVolume: string;
  netFlow: string;
  loading: boolean;
}

interface CustomTickerData {
  ticker: string;
  data: RawRow[];
  loading: boolean;
  error: string;
}

/* ─── mappings ───────────────────────────────────────────────────────── */

const LEVEL_TYPE_MAP: Record<string, { label: string; cat: 'continuous' | 'sub' | 'change' | 'none' }> = {
  continuous:       { label: 'استمراري',     cat: 'continuous' },
  secondary_change: { label: 'فرعي',          cat: 'sub'        },
  direction_change: { label: 'تغيير اتجاه',  cat: 'change'     },
  none:             { label: '—',             cat: 'none'       },
};

const SIGNAL_MAP: Record<string, { label: string; isAccum: boolean }> = {
  accumulation:     { label: 'تجميع',          isAccum: true  },
  distribution:     { label: 'تصريف',          isAccum: false },
  'pre-accumulation': { label: 'قبل تجميع',   isAccum: true  },
  'pre-distribution': { label: 'قبل تصريف',   isAccum: false },
  neutral:          { label: 'محايد',          isAccum: true  },
};

/* ─── config ─────────────────────────────────────────────────────────── */
const API_BASE = 'https://app.qafah.com';

/* ─── helpers ────────────────────────────────────────────────────────── */

/** Create CompanyData from ticker when it's not in categories */
function createCompanyDataFromTicker(ticker: string, rawRows: RawRow[]): CompanyData | null {
  const sorted = [...rawRows].sort((a, b) => a.date.localeCompare(b.date));
  const latestByTicker: Record<string, RawRow> = {};
  for (const row of sorted) {
    latestByTicker[row.holding_ticker] = row;
  }
  
  const row = latestByTicker[ticker];
  if (!row) return null;
  
  return {
    ticker,
    signal: row.load_level_state,
    levelType: row.level_type as any,
    diffCategory: row.DiffCategory_1d,
    load: row.load,
    loadDirection: row.load_direction,
    perf5d: row.LoadChangePerc_5d,
    perf3d: row.LoadChangePerc_3d,
    date: row.date.slice(0, 10),
  };
}

/** Build company list + history rows from raw API rows for a given tab category */
function processRows(rows: RawRow[]): {
  byCategory: Record<'continuous' | 'sub' | 'change', CompanyData[]>;
  latestDate: string;
  historyFor: (ticker: string) => HistoryRow[];
} {
  // sort by date asc
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));

  // latest date
  const latestDate = sorted.length ? sorted[sorted.length - 1].date.slice(0, 10) : '—';

  // group by ticker → history
  const byTicker: Record<string, RawRow[]> = {};
  for (const row of sorted) {
    if (!byTicker[row.holding_ticker]) byTicker[row.holding_ticker] = [];
    byTicker[row.holding_ticker].push(row);
  }

  const historyFor = (ticker: string): HistoryRow[] => {
    const rows = byTicker[ticker] ?? [];
    return [...rows]
      .reverse()
      .slice(0, 30)
      .map(r => ({
        date:      r.date.slice(0, 10),
        direction: r.load_direction,
        load:      r.load,
        level:     r.DiffCategory_1d,
        perf5d:    r.LoadChangePerc_5d,
        perf3d:    r.LoadChangePerc_3d,
      }));
  };

  // latest row per ticker
  const latestByTicker: Record<string, RawRow> = {};
  for (const row of sorted) {
    latestByTicker[row.holding_ticker] = row;
  }

  const byCategory: Record<'continuous' | 'sub' | 'change', CompanyData[]> = {
    continuous: [],
    sub: [],
    change: [],
  };

  for (const [ticker, row] of Object.entries(latestByTicker)) {
    const lt = LEVEL_TYPE_MAP[row.level_type] ?? LEVEL_TYPE_MAP['none'];
    if (lt.cat === 'none') continue;

    const company: CompanyData = {
      ticker,
      signal:        row.load_level_state,
      levelType:     row.level_type as any,
      diffCategory:  row.DiffCategory_1d,
      load:          row.load,
      loadDirection: row.load_direction,
      perf5d:        row.LoadChangePerc_5d,
      perf3d:        row.LoadChangePerc_3d,
      date:          row.date.slice(0, 10),
    };

    byCategory[lt.cat].push(company);
  }

  // sort each bucket: accumulation first, then by abs(load_direction) desc
  // replace the existing sort block
for (const cat of ['continuous', 'sub', 'change'] as const) {
  byCategory[cat].sort((a, b) => {
    const absDiff = Math.abs(b.loadDirection) - Math.abs(a.loadDirection);
    if (absDiff !== 0) return absDiff;
    return a.ticker.localeCompare(b.ticker);  // name asc as tiebreaker
  });
}

  return { byCategory, latestDate, historyFor };
}

/* ─── Ticker logo ────────────────────────────────────────────────────── */
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

/* ─── useStockStats ──────────────────────────────────────────────────── */
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
        setStats({ bidVolume: d.bid_volume ?? '—', askVolume: d.ask_volume ?? '—', netFlow: d.net_flow ?? '—', loading: false });
      })
      .catch(() => setStats({ bidVolume: '—', askVolume: '—', netFlow: '—', loading: false }));
  }, [ticker]);
  return stats;
}

/* ─── useTickerSearch ────────────────────────────────────────────────── */
function useTickerSearch(searchQuery: string): CompanyData | null {
  const [result, setResult] = React.useState<CompanyData | null>(null);
  const [searched, setSearched] = React.useState('');

  React.useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim() === searched) return;
    
    setSearched(searchQuery.trim());
    const query = searchQuery.trim().toUpperCase();
    
    //console.log('🔍 [SEARCH] Searching for ticker:', query);
    
    fetch(`${API_BASE}/api/ticker_resell_signals`)
      .then(r => r.json())
      .then((data: RawRow[]) => {
        const rows = [...data].sort((a, b) => a.date.localeCompare(b.date));
        const latestByTicker: Record<string, RawRow> = {};
        for (const row of rows) {
          latestByTicker[row.holding_ticker] = row;
        }
        
        const allAvailableTickers = Object.keys(latestByTicker).sort();
        //console.log('🔍 [SEARCH] Available tickers in API:', {
        //  count: allAvailableTickers.length,
        //  tickers: allAvailableTickers,
        //});
        
        const row = latestByTicker[query];
        if (row) {
          //console.log('✅ [SEARCH] Found ticker:', query, row);
          const company: CompanyData = {
            ticker: query,
            signal: row.load_level_state,
            levelType: row.level_type as any,
            diffCategory: row.DiffCategory_1d,
            load: row.load,
            loadDirection: row.load_direction,
            perf5d: row.LoadChangePerc_5d,
            perf3d: row.LoadChangePerc_3d,
            date: row.date.slice(0, 10),
          };
          setResult(company);
        } else {
          console.log()//'❌ [SEARCH] Ticker not found:', query);
          setResult(null);
        }
      })
      .catch(err => {
        console.error()//'❌ [SEARCH] Error fetching data:', err);
        setResult(null);
      });
  }, [searchQuery, searched]);

  return result;
}

/* ─── PlotlyChart ────────────────────────────────────────────────────── */
function PlotlyChart({ ticker }: { ticker: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

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
    if (PlotlyGlobal && divRef.current) PlotlyGlobal.purge(divRef.current);

    let waited = 0;
    while (!(window as any).Plotly && waited < 6000) {
      await new Promise(r => setTimeout(r, 200));
      waited += 200;
    }
    const Plotly = (window as any).Plotly;
    if (!Plotly) { setErrMsg('Plotly CDN failed to load'); setStatus('error'); return; }

    try {
      const res = await fetch(`${API_BASE}/api/chart/${encodeURIComponent(t)}`);
      const raw = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d: ChartPayload = JSON.parse(raw);

      const minWeight = Math.min(...d.weight.filter(v => typeof v === 'number'));
      const maxWeight = Math.max(...d.weight.filter(v => typeof v === 'number'));

      const traces = [
        { x: d.dates, y: d.weight, name: 'Load', type: 'scatter', mode: 'lines', line: { color: '#6941c6', width: 3, shape: 'spline' }, fill: 'tozeroy', fillcolor: 'rgba(244, 235, 255, 0.6)', hoverinfo: 'skip'},
        { x: d.dates, y: d.high_3, name: 'High (W3)', type: 'scatter', mode: 'lines', line: { color: '#1375c6d0', width: 1.5, dash: 'dot' },hoverinfo: 'skip' },
        { x: d.dates, y: d.low_3,  name: 'Low (W3)',  type: 'scatter', mode: 'lines', line: { color: '#1374c6d0', width: 1.5, dash: 'dot' },hoverinfo: 'skip' },
        {
          x: d.signals.positive_real.map(s => s.date), y: d.signals.positive_real.map(s => s.weight),
          text: d.signals.positive_real.map(s => String(s.level)), name: 'Pos Real',hoverinfo: 'skip',
          type: 'scatter', mode: 'markers+text', textposition: 'top center',
          marker: { size: 9, color: 'rgba(0,255,136,0.3)', symbol: 'diamond', line: { width: 2, color: '#00cc70' } },
          textfont: { size: 13, color: '#00cc70', family: 'monospace' },
        },
        {
          x: d.signals.negative_real.map(s => s.date), y: d.signals.negative_real.map(s => s.weight),
          text: d.signals.negative_real.map(s => String(s.level)), name: 'Neg Real',hoverinfo: 'skip',
          type: 'scatter', mode: 'markers+text', textposition: 'top center',
          marker: { size: 9, color: 'rgba(255,68,102,0.3)', symbol: 'diamond', line: { width: 2, color: '#e63946' } },
          textfont: { size: 13, color: '#e63946', family: 'monospace' },
        },
        {
          x: d.signals.positive_internal.map(s => s.date), y: d.signals.positive_internal.map(s => s.weight),
          text: d.signals.positive_internal.map(s => String(s.level)), name: 'Pos Internal',hoverinfo: 'skip',
          type: 'scatter', mode: 'markers+text', textposition: 'bottom center',
          marker: { size: 9, color: 'rgba(0,212,255,0.3)', symbol: 'circle', line: { width: 2, color: '#0096c7' } },
          textfont: { size: 12, color: '#0096c7', family: 'monospace' },
        },
        {
          x: d.signals.negative_internal.map(s => s.date), y: d.signals.negative_internal.map(s => s.weight),
          text: d.signals.negative_internal.map(s => String(s.level)), name: 'Neg Internal',hoverinfo: 'skip',
          type: 'scatter', mode: 'markers+text', textposition: 'bottom center',
          marker: { size: 9, color: 'rgba(255,149,0,0.3)', symbol: 'circle', line: { width: 2, color: '#d97706' } },
          textfont: { size: 12, color: '#d97706', family: 'monospace' },
        },
      ];

      const layout = {
        margin: { t: 20, b: 130, l: 60, r: 20 },
          xaxis: {
            title: 'التاريخ',
    showgrid: false
  },
  yaxis: {
    showgrid: true,
    gridcolor: "#dc8bff48",
    gridwidth: 1,
    color: '#00000000',
    range: [minWeight * 0.95, maxWeight * 1.05]
  },
        hovermode: 'closest', showlegend: false,dragmode: 'pan',
        legend: { orientation: 'h', x: 0, y: -0.28, xanchor: 'left', yanchor: 'top', font: { size: 11, color: '#1e293b' }, bgcolor: 'rgba(255,255,255,0)', borderwidth: 0 },
        paper_bgcolor: '#ffffff', plot_bgcolor: '#ffffff', height: 520,
      };

      Plotly.react(divRef.current, traces, layout, { displayModeBar: false, scrollZoom: true,responsive: true });
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
          <pre className="text-xs text-red-500 font-mono whitespace-pre-wrap text-center max-w-full break-words">{errMsg}</pre>
          <button onClick={() => drawChart(ticker)} className="text-xs underline text-slate-500 hover:text-slate-800 mt-1">إعادة المحاولة</button>
        </div>
      )}
      <div ref={divRef} />
    </div>
  );
}

/* ─── Badges ─────────────────────────────────────────────────────────── */
const SignalBadge = ({ signal }: { signal: string }) => {
  const m = SIGNAL_MAP[signal] ?? SIGNAL_MAP['neutral'];
  return m.isAccum
    ? <Badge className="bg-emerald-500 text-white border-0 text-xs"><TrendingUp className="w-3 h-3 ml-1" />{m.label}</Badge>
    : <Badge className="bg-red-500 text-white border-0 text-xs"><TrendingDown className="w-3 h-3 ml-1" />{m.label}</Badge>;
};

const LevelTypeBadge = ({ levelType }: { levelType: string }) => {
  const colors: Record<string, string> = {
    continuous:       'bg-purple-100 text-purple-700',
    secondary_change: 'bg-blue-100 text-blue-700',
    direction_change: 'bg-orange-100 text-orange-700',
    none:             'bg-slate-100 text-slate-500',
  };
  return (
    <Badge className={`text-xs ${colors[levelType] ?? colors['none']}`}>
      {LEVEL_TYPE_MAP[levelType]?.label ?? '—'}
    </Badge>
  );
};

/* ─── HistoryTable ───────────────────────────────────────────────────── */
function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  if (!rows.length) return (
    <p className="text-slate-400 text-sm text-center py-6">لا توجد بيانات سابقة</p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 rounded-lg">
            {['التاريخ', 'الاتجاه', 'المستوى', '5 أيام', '3 أيام'].map(h => (
              <th key={h} className="text-right py-2.5 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              {/* التاريخ */}
              <td className="py-2.5 px-3 text-slate-700 font-mono text-xs">{row.date}</td>

              {/* الاتجاه — load_direction */}
              <td className="py-2.5 px-3">
                <span className={`inline-flex items-center gap-1 font-semibold ${row.direction > 0 ? 'text-emerald-600' : row.direction < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  {row.direction > 0 ? '↑' : row.direction < 0 ? '↓' : '—'}{' '}
                  {row.direction !== 0 ? (row.direction > 0 ? `+${row.direction}` : row.direction) : '0'}
                </span>
              </td>



              {/* المستوى — DiffCategory_1d */}
              <td className="py-2.5 px-3">
                <Badge className="bg-slate-100 text-slate-600 text-xs font-mono">{row.level}</Badge>
              </td>

              {/* 5 أيام — LoadChangePerc_5d (string like "1.23%") */}
              <td className={`py-2.5 px-3 font-medium text-xs ${
                row.perf5d?.startsWith('-') ? 'text-red-500' : row.perf5d === 'N/A' ? 'text-slate-400' : 'text-emerald-600'
              }`}>
                {row.perf5d === 'N/A' ? '—' : row.perf5d?.startsWith('-') ? row.perf5d : `+${row.perf5d}`}
              </td>

              {/* 3 أيام — LoadChangePerc_3d */}
              <td className={`py-2.5 px-3 font-medium text-xs ${
                row.perf3d?.startsWith('-') ? 'text-red-500' : row.perf3d === 'N/A' ? 'text-slate-400' : 'text-emerald-600'
              }`}>
                {row.perf3d === 'N/A' ? '—' : row.perf3d?.startsWith('-') ? row.perf3d : `+${row.perf3d}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════════════════════ */
export function CompaniesAccumulationPage() {
  const [selectedCategory, setSelectedCategory] = useState<'continuous' | 'sub' | 'change'>('continuous');
  const [selectedCompany,  setSelectedCompany]  = useState<CompanyData | null>(null);
  const [searchQuery,      setSearchQuery]       = useState('');

  // Raw API data
  const [rawRows,     setRawRows]     = useState<RawRow[]>([]);
  const [sigsLoading, setSigsLoading] = useState(true);
  const [sigsError,   setSigsError]   = useState('');
  const [latestDate,  setLatestDate]  = useState('…');
  const [uniqueTickers, setUniqueTickers] = useState<string[]>([]);

  // Processed bucketed data
  const [byCategory,   setByCategory]   = useState<Record<'continuous' | 'sub' | 'change', CompanyData[]>>({ continuous: [], sub: [], change: [] });
  const [historyFn,    setHistoryFn]    = useState<(t: string) => HistoryRow[]>(() => () => []);

  // Dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);

  // Search for ticker outside of categories
  const searchedTickerData = useTickerSearch(searchQuery);

  // Live stock stats
  const stockStats = useStockStats(selectedCompany?.ticker);

  // ── Fetch /api/ticker_resell_signals ─────────────────────────────────
  const fetchSignals = useCallback((mode = 'cached') => {
    setSigsLoading(true);
    setSigsError('');
    fetch(`${API_BASE}/api/ticker_resell_signals?mode=${mode}`)
      .then(r => r.json())
      .then((data: RawRow[]) => {
        // 🔍 DEBUG: Log all tickers from API
        const allTickers = [...new Set(data.map(row => row.holding_ticker))];
        //console.log('🔍 [DEBUG] Tickers from API:', {
        //  totalRows: data.length,
        //  uniqueTickers: allTickers.length,
        //  tickers: allTickers.sort(),
        //});
        
        setRawRows(data);
        setUniqueTickers(allTickers.sort());
        
        const { byCategory: bc, latestDate: ld, historyFor } = processRows(data);
        
        // 🔍 DEBUG: Log categorized tickers
        //console.log('🔍 [DEBUG] Categorized Tickers:', {
        //  continuous: bc.continuous.map(c => c.ticker),
        //  sub: bc.sub.map(c => c.ticker),
        //  change: bc.change.map(c => c.ticker),
        //  total: bc.continuous.length + bc.sub.length + bc.change.length,
        //});
        
        setByCategory(bc);
        setLatestDate(ld);
        setHistoryFn(() => historyFor);
        // auto-select first company
        const first = bc.continuous[0] ?? bc.sub[0] ?? bc.change[0] ?? null;
        setSelectedCompany(first ?? null);
      })
      .catch(e => setSigsError(String(e)))
      .finally(() => setSigsLoading(false));
  }, []);

  useEffect(() => { fetchSignals('cached'); }, [fetchSignals]);

  // Auto-select first company when tab changes
  useEffect(() => {
    const first = byCategory[selectedCategory]?.[0] ?? null;
    setSelectedCompany(first ?? null);
  }, [selectedCategory, byCategory]);

  // ── Derived ───────────────────────────────────────────────────────────
  const allInCategory = byCategory[selectedCategory] ?? [];

  const counts = {
    continuous: byCategory.continuous.length,
    sub:        byCategory.sub.length,
    change:     byCategory.change.length,
  };

  const historyRows: HistoryRow[] = selectedCompany ? historyFn(selectedCompany.ticker) : [];

  const categoryMeta = {
    continuous: { color: 'bg-purple-600', icon: <RefreshCw  className="w-4 h-4 ml-2" />, label: 'استمراري'    },
    sub:        { color: 'bg-blue-600',   icon: <Activity    className="w-4 h-4 ml-2" />, label: 'فرعي'        },
    change:     { color: 'bg-orange-600', icon: <ArrowUpDown className="w-4 h-4 ml-2" />, label: 'تغيير اتجاه' },
  } as const;

  // Build dropdown results: companies + unique tickers not in categories
  const allCompaniesInCategories = [
    ...byCategory.continuous,
    ...byCategory.sub,
    ...byCategory.change,
  ];
  
  const dropdownResults = searchQuery.trim()
    ? [
        // First: matching companies from categories
        ...allCompaniesInCategories.filter(c =>
          c.ticker.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        // Then: unique tickers not already in categories
        ...uniqueTickers
          .filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
          .filter(t => !allCompaniesInCategories.some(c => c.ticker === t))
          .slice(0, 20) // limit to 20 additional tickers
          .map(t => createCompanyDataFromTicker(t, rawRows))
          .filter(c => c !== null) as CompanyData[],
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
  {/* Replaced the <img> tag with your component */}
  <div className="w-12 h-12 flex items-center justify-center">
    <QafahLogo />
  </div>
  
  <span className="text-lg font-bold tracking-tight text-slate-800">Qafah</span>
</div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>فاحص السوق</span>
              <span className="text-slate-300">|</span>
              <span>آخر تحديث: {latestDate}</span>
              <button
                onClick={() => fetchSignals('recalc')}
                className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors"
                disabled={sigsLoading}
              >
                <RefreshCw className={`w-3 h-3 ${sigsLoading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Category tabs ─────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['continuous', 'sub', 'change'] as const).map(cat => {
            const m  = categoryMeta[cat];
            const ac = selectedCategory === cat && !searchQuery;
            return (
              <Button
                key={cat}
                variant={ac ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery('');
                }}
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
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <SignalBadge signal={selectedCompany.signal} />
                          <LevelTypeBadge levelType={selectedCompany.levelType} />
                          <Badge className="bg-slate-100 text-slate-600 text-xs font-mono">{selectedCompany.diffCategory}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${selectedCompany.loadDirection >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {selectedCompany.loadDirection}{selectedCompany.loadDirection > 0 ? '+' : ''}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">اتجاه الحمل</p>
                    </div>
                  </div>
                ) : (
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

                {/* Live market stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'حجم الشراء',    val: stockStats.bidVolume, bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
                    { label: 'حجم البيع',     val: stockStats.askVolume, bg: 'bg-red-50 border-red-100',         text: 'text-red-600'     },
                    { label: 'التدفق الصافي', val: stockStats.netFlow,   bg: 'bg-purple-50 border-purple-100',   text: 'text-purple-600'  },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} border rounded-xl p-3 text-center`}>
                      <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                      <p className={`font-bold text-sm ${s.text} ${stockStats.loading ? 'animate-pulse' : ''}`}>{s.val}</p>
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
                  {selectedCompany && (
                    <span className="text-sm font-normal text-slate-400 mr-2">— {selectedCompany.ticker}</span>
                  )}
                </h3>
                {sigsLoading
                  ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}</div>
                  :     <div className="max-h-[25vh] overflow-y-auto">
      <HistoryTable rows={historyRows} />
    </div>
                }
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Company list ──────────────────────────────────── */}
          <div dir="rtl" className="flex flex-col" style={{ maxHeight: 'calc(100vh - 160px)', position: 'sticky', top: '76px' }}>

            {/* Unified Search */}
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(e.target.value.trim().length > 0);
                }}
                onFocus={() => setShowDropdown(searchQuery.trim().length > 0)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="بحث عن شركة أو رمز تداول..."
                className="w-full pr-9 pl-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-slate-400"
              />
              
              {/* Dropdown results with card format */}
              {showDropdown && dropdownResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50 max-h-80 overflow-y-auto">
                  {dropdownResults.map(company => {
                    const sigMeta = SIGNAL_MAP[company.signal] ?? SIGNAL_MAP['neutral'];
                    const isNotInCategory = !allCompaniesInCategories.some(c => c.ticker === company.ticker);
                    return (
                      <div
                        key={company.ticker}
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDropdown(false);
                        }}
                        className={`border-b last:border-0 p-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                          isNotInCategory ? 'bg-amber-50/50 hover:bg-amber-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <TickerLogo ticker={company.ticker} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-slate-900 text-sm">{company.ticker}</span>
                              {isNotInCategory && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                  جديد
                                </span>
                              )}
                              <SignalBadge signal={company.signal} />
                            </div>
                            <div className="flex items-center gap-1 flex-wrap text-xs">
                              <Badge className="bg-slate-100 text-slate-600 font-mono text-xs">{company.diffCategory}</Badge>
                              <span className={`font-semibold px-1.5 py-0.5 rounded-md font-mono text-xs ${
                                company.loadDirection > 0 ? 'bg-emerald-50 text-emerald-700' : company.loadDirection < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                              }`}>
                                {company.loadDirection > 0 ? '+' : ''}{company.loadDirection}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {showDropdown && searchQuery.trim() && dropdownResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50 p-3 text-center text-sm text-slate-500">
                  لا توجد نتائج
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
              قائمة الشركات ({sigsLoading ? '…' : allInCategory.length})
            </p>

            {/* Scrollable list */}
            <div className="overflow-y-auto flex-1 space-y-2 pl-0.5 pr-0.5" >

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
              {!sigsLoading && allInCategory.map(company => {
                const sigMeta = SIGNAL_MAP[company.signal] ?? SIGNAL_MAP['neutral'];
                return (
                  <Card
                    key={company.ticker}
                    onClick={() => setSelectedCompany(company)}
                    className={`border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCompany?.ticker === company.ticker
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : sigMeta.isAccum
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
                            {/*<LevelTypeBadge levelType={company.levelType} />*/}
                            <Badge className="bg-slate-100 text-slate-600 text-xs font-mono">{company.diffCategory}</Badge>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            {/* load direction pill */}
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md font-mono ${
                              company.loadDirection > 0 ? 'bg-emerald-50 text-emerald-700' : company.loadDirection < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                            }`}>
                              {company.loadDirection > 0 ? '+' : ''}{company.loadDirection}
                            </span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                              company.perf5d?.startsWith('-') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              5d {company.perf5d === 'N/A' ? '—' : company.perf5d?.startsWith('-') ? company.perf5d : `+${company.perf5d}`}
                            </span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                              company.perf3d?.startsWith('-') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              3d {company.perf3d === 'N/A' ? '—' : company.perf3d?.startsWith('-') ? company.perf3d : `+${company.perf3d}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {!sigsLoading && allInCategory.length === 0 && !sigsError && (
                <div className="text-center text-slate-400 text-sm py-8">لا توجد شركات في هذه الفئة</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}