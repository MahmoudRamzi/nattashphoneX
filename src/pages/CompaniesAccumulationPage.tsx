import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, RefreshCw, ArrowRightLeft,
  ShoppingCart, RotateCcw, Plus, Activity, ArrowUpDown,
  AlertCircle, Loader2, Search,
} from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';          // ← shared sidebar
import type { AuthUser } from '@/hooks/useAuth';
import * as echarts from 'echarts';

/* ─── types ─────────────────────────────────────────────────────────── */
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

/* ─── mappings ───────────────────────────────────────────────────────── */
const LEVEL_TYPE_MAP: Record<string, { label: string; cat: 'continuous' | 'sub' | 'change' | 'none' }> = {
  continuous:       { label: 'استمراري',     cat: 'continuous' },
  secondary_change: { label: 'فرعي',          cat: 'sub'        },
  direction_change: { label: 'تغيير اتجاه',  cat: 'change'     },
  none:             { label: '—',             cat: 'none'       },
};

const SIGNAL_MAP: Record<string, { label: string; isAccum: boolean }> = {
  accumulation:       { label: 'تجميع',        isAccum: true  },
  distribution:       { label: 'تصريف',        isAccum: false },
  'pre-accumulation': { label: 'تجميع فرعي',   isAccum: true  },
  'pre-distribution': { label: 'تصريف فرعي',   isAccum: false },
  neutral:            { label: 'محايد',        isAccum: true  },
};

/* ─── config ─────────────────────────────────────────────────────────── */
const API_BASE = 'https://app.qafah.com';

/* ─── helpers ────────────────────────────────────────────────────────── */
function createCompanyDataFromTicker(ticker: string, rawRows: RawRow[]): CompanyData | null {
  const sorted = [...rawRows].sort((a, b) => a.date.localeCompare(b.date));
  const latestByTicker: Record<string, RawRow> = {};
  for (const row of sorted) { latestByTicker[row.holding_ticker] = row; }
  const row = latestByTicker[ticker];
  if (!row) return null;
  return {
    ticker, signal: row.load_level_state, levelType: row.level_type as any,
    diffCategory: row.DiffCategory_1d, load: row.load, loadDirection: row.load_direction,
    perf5d: row.LoadChangePerc_5d, perf3d: row.LoadChangePerc_3d, date: row.date.slice(0, 10),
  };
}

function processRows(rows: RawRow[]): {
  byCategory: Record<'continuous' | 'sub' | 'change', CompanyData[]>;
  latestDate: string;
  historyFor: (ticker: string) => HistoryRow[];
} {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const latestDate = sorted.length ? sorted[sorted.length - 1].date.slice(0, 10) : '—';
  const byTicker: Record<string, RawRow[]> = {};
  for (const row of sorted) {
    if (!byTicker[row.holding_ticker]) byTicker[row.holding_ticker] = [];
    byTicker[row.holding_ticker].push(row);
  }
  const historyFor = (ticker: string): HistoryRow[] =>
    [...(byTicker[ticker] ?? [])].reverse().slice(0, 30).map(r => ({
      date: r.date.slice(0, 10), direction: r.load_direction, load: r.load,
      level: r.DiffCategory_1d, perf5d: r.LoadChangePerc_5d, perf3d: r.LoadChangePerc_3d,
    }));
  const latestByTicker: Record<string, RawRow> = {};
  for (const row of sorted) { latestByTicker[row.holding_ticker] = row; }
  const byCategory: Record<'continuous' | 'sub' | 'change', CompanyData[]> = { continuous: [], sub: [], change: [] };
  for (const [ticker, row] of Object.entries(latestByTicker)) {
    const lt = LEVEL_TYPE_MAP[row.level_type] ?? LEVEL_TYPE_MAP['none'];
    if (lt.cat === 'none') continue;
    byCategory[lt.cat].push({
      ticker, signal: row.load_level_state, levelType: row.level_type as any,
      diffCategory: row.DiffCategory_1d, load: row.load, loadDirection: row.load_direction,
      perf5d: row.LoadChangePerc_5d, perf3d: row.LoadChangePerc_3d, date: row.date.slice(0, 10),
    });
  }
  for (const cat of ['continuous', 'sub', 'change'] as const) {
    byCategory[cat].sort((a, b) => {
      const absDiff = Math.abs(b.loadDirection) - Math.abs(a.loadDirection);
      if (absDiff !== 0) return absDiff;
      return a.ticker.localeCompare(b.ticker);
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
        ? <img src={`${API_BASE}/static/logos_tickers/${ticker}.png`} alt={ticker} className="w-full h-full object-contain" onError={() => setErr(true)} />
        : <span className="text-white font-bold">{ticker.slice(0, 3)}</span>
      }
    </div>
  );
}

/* ─── useStockStats ──────────────────────────────────────────────────── */
function useStockStats(ticker: string | undefined): StockStats {
  const [stats, setStats] = React.useState<StockStats>({ bidVolume: '…', askVolume: '…', netFlow: '…', loading: true });
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
    fetch(`${API_BASE}/api/ticker_resell_signals`)
      .then(r => r.json())
      .then((data: RawRow[]) => {
        const rows = [...data].sort((a, b) => a.date.localeCompare(b.date));
        const latestByTicker: Record<string, RawRow> = {};
        for (const row of rows) { latestByTicker[row.holding_ticker] = row; }
        const row = latestByTicker[query];
        if (row) {
          setResult({ ticker: query, signal: row.load_level_state, levelType: row.level_type as any,
            diffCategory: row.DiffCategory_1d, load: row.load, loadDirection: row.load_direction,
            perf5d: row.LoadChangePerc_5d, perf3d: row.LoadChangePerc_3d, date: row.date.slice(0, 10) });
        } else { setResult(null); }
      })
      .catch(() => setResult(null));
  }, [searchQuery, searched]);
  return result;
}

/* ─── EChartsChart ──────────────────────────────────────────────────── */
function EChartsChart({ ticker }: { ticker: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const drawChart = useCallback(async (t: string) => {
    if (!t) return;
    setStatus('loading');
    setErrMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/chart/${encodeURIComponent(t)}`);
      const raw = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const d: ChartPayload = JSON.parse(raw);
      
      if (!divRef.current) return;

      // Initialize chart if not already done
      if (!chartRef.current) {
        chartRef.current = echarts.init(divRef.current, null, { renderer: 'canvas' });
      }

      const minWeight = Math.min(...d.weight.filter(v => typeof v === 'number'));
      const maxWeight = Math.max(...d.weight.filter(v => typeof v === 'number'));
      const padding = (maxWeight - minWeight) * 0.1;


            // Format dates: "7 Mar", "10 Oct", show year when it changes
      const formatDatesDisplay = (dates: string[]): string[] => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let lastYear = '';
        return dates.map(dateStr => {
          const [year, month, day] = dateStr.split('-');
          const monthName = months[parseInt(month) - 1];
          const dayNum = parseInt(day);
          let formatted = `${dayNum} ${monthName}`;
          if (year !== lastYear) {
            formatted += ` ${year}`;
            lastYear = year;
          }
          return formatted;
        });
      };

      const formattedDates = formatDatesDisplay(d.dates);

      // Create series data - use date index instead of date string for categorical X-axis
      const positiveRealData = d.signals.positive_real.map(s => {
        const dateIndex = d.dates.indexOf(s.date);
        return {
          value: [dateIndex, s.weight, s.level],
          itemStyle: { color: 'rgba(0,204,112,0.7)' },
        };
      });

      const negativeRealData = d.signals.negative_real.map(s => {
        const dateIndex = d.dates.indexOf(s.date);
        return {
          value: [dateIndex, s.weight, s.level],
          itemStyle: { color: 'rgba(230,57,70,0.7)' },
        };
      });

      const positiveInternalData = d.signals.positive_internal.map(s => {
        const dateIndex = d.dates.indexOf(s.date);
        return {
          value: [dateIndex, s.weight, s.level],
          itemStyle: { color: 'rgba(0,150,199,0.7)' },
        };
      });

      const negativeInternalData = d.signals.negative_internal.map(s => {
        const dateIndex = d.dates.indexOf(s.date);
        return {
          value: [dateIndex, s.weight, s.level],
          itemStyle: { color: 'rgba(217,119,6,0.7)' },
        };
      });

      const option: echarts.EChartsOption = {
        backgroundColor: '#ffffff',
        tooltip: {
          trigger: 'axis',
          transitionDuration: 0,
          confine: true,
          formatter: (params: any) => {
            if (Array.isArray(params) && params.length > 0) {
              const param = params[0];
              const dateStr = formattedDates[param.dataIndex];
              const hoverDate = d.dates[param.dataIndex];
              
              // Count signals at the hovered date
              const posRealCount = d.signals.positive_real.filter(s => s.date === hoverDate).length;
              const negRealCount = d.signals.negative_real.filter(s => s.date === hoverDate).length;
              const posInternalCount = d.signals.positive_internal.filter(s => s.date === hoverDate).length;
              const negInternalCount = d.signals.negative_internal.filter(s => s.date === hoverDate).length;
              
              let tooltip = `<strong>${dateStr}</strong><br/>`;
              if (posRealCount > 0) tooltip += `Pos Real: ${posRealCount}<br/>`;
              if (negRealCount > 0) tooltip += `Neg Real: ${negRealCount}<br/>`;
              if (posInternalCount > 0) tooltip += `Pos Internal: ${posInternalCount}<br/>`;
              if (negInternalCount > 0) tooltip += `Neg Internal: ${negInternalCount}<br/>`;
              
              return tooltip || dateStr;
            }
            return '';
          },
        },
        grid: {
          left: '6px',
          right: '2px',
          top: '2px',
          bottom: '80px',
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          data: formattedDates,
          axisLabel: {
            fontSize: 11,
            color: '#666',
            rotate: 45,
            interval: 'auto',
            hideOverlap: true,
          },
          axisLine: { lineStyle: { color: '#ddd' } },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          name: 'Load',
          position: 'right',
          axisLabel: { show: false },
          axisLine: { lineStyle: { color: '#ddd' } },
          splitLine: { lineStyle: { color: '#eee', type: 'dashed' } },
          min: minWeight - padding,
          max: maxWeight + padding,
        },
        dataZoom: [
          {
            type: 'slider',
            show: false,
            yAxisIndex: [0],
            xAxisIndex: [0],
            start: 0,
            end: 100,
            textStyle: { color: '#666', fontSize: 10 },
            borderColor: 'transparent',
            fillerColor: 'transparent',
            handleSize: 8,
            bottom: '10px',
            height: '20px',
          },
          {
            type: 'inside',
            xAxisIndex: [0],

            start: 0,
            end: 100,
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
            moveOnMouseWheel: false,
          },
        ],
        series: [
          {
            name: 'Load',
            data: d.weight,
            type: 'line',
            smooth: 0.3,
            lineStyle: { color: '#6941c6', width: 3 },
            areaStyle: { color: 'rgba(244,235,255,0.6)' },
            itemStyle: { opacity: 0 },
            hoverAnimation: false,
            sampling: 'lttb',
          } as echarts.LineSeriesOption,
          {
            name: 'High (W3)',
            data: d.high_3,
            type: 'line',
            smooth: false,
            lineStyle: { color: '#b3b3ff', width: 1.5, type: 'dotted' },
            itemStyle: { opacity: 0 },
            hoverAnimation: false,
            sampling: 'lttb',
          } as echarts.LineSeriesOption,
          {
            name: 'Low (W3)',
            data: d.low_3,
            type: 'line',
            smooth: false,
            lineStyle: { color: '#b3b3ff', width: 1.5, type: 'dotted' },
            itemStyle: { opacity: 0 },
            hoverAnimation: false,
            sampling: 'lttb',
          } as echarts.LineSeriesOption,
          {
            name: 'Pos Real',
            data: positiveRealData,
            type: 'scatter',
            symbolSize: 9,
            itemStyle: { 
              color: 'rgba(0,204,112,0.7)',
              borderColor: '#00cc70',
              borderWidth: 2,
            },
            label: {
              show: true,
              position: 'top',
              formatter: (p: any) => String(p.value?.[2] ?? ''),
              fontSize: 12,
              fontWeight: 'bold',
              color: '#009944',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: [2, 4],
              borderRadius: 2,
            },
          } as echarts.ScatterSeriesOption,
          {
            name: 'Neg Real',
            data: negativeRealData,
            type: 'scatter',
            symbolSize: 9,
            itemStyle: {
              color: 'rgba(230,57,70,0.7)',
              borderColor: '#e63946',
              borderWidth: 2,
            },
            label: {
              show: true,
              position: 'top',
              formatter: (p: any) => String(p.value?.[2] ?? ''),
              fontSize: 12,
              fontWeight: 'bold',
              color: '#dd0000',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: [2, 4],
              borderRadius: 2,
            },
          } as echarts.ScatterSeriesOption,
          {
            name: 'Pos Internal',
            data: positiveInternalData,
            type: 'scatter',
            symbolSize: 8,
            itemStyle: {
              color: 'rgba(0,150,199,0.7)',
              borderColor: '#0096c7',
              borderWidth: 2,
            },
            label: {
              show: true,
              position: 'bottom',
              formatter: (p: any) => String(p.value?.[2] ?? ''),
              fontSize: 11,
              fontWeight: 'bold',
              color: '#0055dd',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: [2, 4],
              borderRadius: 2,
            },
          } as echarts.ScatterSeriesOption,
          {
            name: 'Neg Internal',
            data: negativeInternalData,
            type: 'scatter',
            symbolSize: 8,
            itemStyle: {
              color: 'rgba(217,119,6,0.7)',
              borderColor: '#d97706',
              borderWidth: 2,
            },
            label: {
              show: true,
              position: 'bottom',
              formatter: (p: any) => String(p.value?.[2] ?? ''),
              fontSize: 11,
              fontWeight: 'bold',
              color: '#cc5500',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: [2, 4],
              borderRadius: 2,
            },
          } as echarts.ScatterSeriesOption,
        ],
        animation: true,
        animationDuration: 500,
      };

      chartRef.current.setOption(option);
      setStatus('idle');
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    drawChart(ticker);
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ticker, drawChart]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, []);

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
      <div ref={divRef} style={{ width: '100%', height: '100%', minHeight: '520px' }} />
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
  return <Badge className={`text-xs ${colors[levelType] ?? colors['none']}`}>{LEVEL_TYPE_MAP[levelType]?.label ?? '—'}</Badge>;
};

/* ─── HistoryTable ───────────────────────────────────────────────────── */
function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  if (!rows.length) return <p className="text-slate-400 text-sm text-center py-6">لا توجد بيانات سابقة</p>;
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
              <td className="py-2.5 px-3 text-slate-700 font-mono text-xs">{row.date}</td>
              <td className="py-2.5 px-3">
                <span className={`inline-flex items-center gap-1 font-semibold ${row.direction > 0 ? 'text-emerald-600' : row.direction < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  {row.direction > 0 ? '↑' : row.direction < 0 ? '↓' : '—'}{' '}
                  {row.direction !== 0 ? (row.direction > 0 ? `+${row.direction}` : row.direction) : '0'}
                </span>
              </td>
              <td className="py-2.5 px-3"><Badge className="bg-slate-100 text-slate-600 text-xs font-mono">{row.level}</Badge></td>
              <td className={`py-2.5 px-3 font-medium text-xs ${row.perf5d?.startsWith('-') ? 'text-red-500' : row.perf5d === 'N/A' ? 'text-slate-400' : 'text-emerald-600'}`}>
                {row.perf5d === 'N/A' ? '—' : row.perf5d?.startsWith('-') ? row.perf5d : `+${row.perf5d}`}
              </td>
              <td className={`py-2.5 px-3 font-medium text-xs ${row.perf3d?.startsWith('-') ? 'text-red-500' : row.perf3d === 'N/A' ? 'text-slate-400' : 'text-emerald-600'}`}>
                {row.perf3d === 'N/A' ? '—' : row.perf3d?.startsWith('-') ? row.perf3d : `+${row.perf3d}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Page props ─────────────────────────────────────────────────────── */
type Page =
  | 'home' | 'login' | 'register' | 'pricing' | 'education'
  | 'admin' | 'dashboard' | 'alerts' | 'employee' | 'leaderboard'
| 'admin-employees' | 'companies-accumulation' | 'premarket' | 'ticker-resell-signals';

interface CompaniesAccumulationPageProps {
  navigate: (page: Page) => void;   // required — needed for sidebar navigation
  onLogout?: () => void;
  user?: AuthUser | null;
}

/* ═══════════════════════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════════════════════ */
export function CompaniesAccumulationPage({ navigate, onLogout, user }: CompaniesAccumulationPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<'continuous' | 'sub' | 'change'>('continuous');
  const [selectedCompany,  setSelectedCompany]  = useState<CompanyData | null>(null);
  const [searchQuery,      setSearchQuery]       = useState('');

  const [rawRows,     setRawRows]     = useState<RawRow[]>([]);
  const [sigsLoading, setSigsLoading] = useState(true);
  const [sigsError,   setSigsError]   = useState('');
  const [latestDate,  setLatestDate]  = useState('…');
  const [uniqueTickers, setUniqueTickers] = useState<string[]>([]);

  const [byCategory, setByCategory] = useState<Record<'continuous' | 'sub' | 'change', CompanyData[]>>({ continuous: [], sub: [], change: [] });
  const [historyFn,  setHistoryFn]  = useState<(t: string) => HistoryRow[]>(() => () => []);

  const [showDropdown, setShowDropdown] = useState(false);
  // ── CHANGE 1: new signal filter state (line 287) ──
  const [signalFilter, setSignalFilter] = useState<'all' | 'accum' | 'distrib'>('all');

  const searchedTickerData = useTickerSearch(searchQuery);
  const stockStats = useStockStats(selectedCompany?.ticker);

  const fetchSignals = useCallback((mode = 'cached') => {
    setSigsLoading(true); setSigsError('');
    fetch(`${API_BASE}/api/ticker_resell_signals?mode=${mode}`)
      .then(r => r.json())
      .then((data: RawRow[]) => {
        const allTickers = [...new Set(data.map(row => row.holding_ticker))];
        setRawRows(data);
        setUniqueTickers(allTickers.sort());
        const { byCategory: bc, latestDate: ld, historyFor } = processRows(data);
        setByCategory(bc);
        setLatestDate(ld);
        setHistoryFn(() => historyFor);
        const first = bc.continuous[0] ?? bc.sub[0] ?? bc.change[0] ?? null;
        setSelectedCompany(first ?? null);
      })
      .catch(e => setSigsError(String(e)))
      .finally(() => setSigsLoading(false));
  }, []);

  useEffect(() => { fetchSignals('cached'); }, [fetchSignals]);

  useEffect(() => {
    const first = byCategory[selectedCategory]?.[0] ?? null;
    setSelectedCompany(first ?? null);
  }, [selectedCategory, byCategory]);

  // ── CHANGE 2: filter allInCategory by signalFilter (line 289 replaced) ──
  const allInCategory = (byCategory[selectedCategory] ?? []).filter(company => {
    if (signalFilter === 'all') return true;
    const isAccum = ['accumulation', 'pre-accumulation'].includes(company.signal);
    if (signalFilter === 'accum') return isAccum;
    if (signalFilter === 'distrib') return !isAccum;
    return true;
  });

  const counts = { continuous: byCategory.continuous.length, sub: byCategory.sub.length, change: byCategory.change.length };
  
  // Calculate signal counts within current category
  const currentCategoryCompanies = byCategory[selectedCategory] ?? [];
  const accumCount = currentCategoryCompanies.filter(c => ['accumulation', 'pre-accumulation'].includes(c.signal)).length;
  const distribCount = currentCategoryCompanies.filter(c => !['accumulation', 'pre-accumulation'].includes(c.signal) && c.signal !== 'neutral').length;
  const historyRows: HistoryRow[] = selectedCompany ? historyFn(selectedCompany.ticker) : [];

  const categoryMeta = {
    continuous: { color: 'bg-purple-600', icon: <RefreshCw  className="w-4 h-4 ml-2" />, label: 'استمراري'    },
    sub:        { color: 'bg-blue-600',   icon: <Activity    className="w-4 h-4 ml-2" />, label: 'فرعي'        },
    change:     { color: 'bg-orange-600', icon: <ArrowUpDown className="w-4 h-4 ml-2" />, label: 'تغيير اتجاه' },
  } as const;

  const allCompaniesInCategories = [...byCategory.continuous, ...byCategory.sub, ...byCategory.change];
  const dropdownResults = searchQuery.trim()
    ? [
        ...allCompaniesInCategories.filter(c => c.ticker.toLowerCase().includes(searchQuery.toLowerCase())),
        ...uniqueTickers
          .filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
          .filter(t => !allCompaniesInCategories.some(c => c.ticker === t))
          .slice(0, 20)
          .map(t => createCompanyDataFromTicker(t, rawRows))
          .filter(c => c !== null) as CompanyData[],
      ]
    : [];



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">

      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm h-16">
        <div className="px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
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
      </nav>

      <div className="flex flex-1">

        {/* ── Shared Sidebar ── */}
        <AppSidebar
          navigate={navigate}
          onLogout={onLogout}
          user={user}
          activePage="companies-accumulation"
        />

        {/* ── Main content ── */}
        <main className="flex-1 p-6 overflow-auto">

          {/* ── Category tabs ─────────────────────────────────────── */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(['continuous', 'sub', 'change'] as const).map(cat => {
              const m  = categoryMeta[cat];
              const ac = selectedCategory === cat && !searchQuery;
              return (
                <Button
                  key={cat}
                  variant={ac ? 'default' : 'outline'}
                  onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
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

          {/* ── Error banner ───────────────────────────────────────── */}
          {sigsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              فشل تحميل البيانات: {sigsError}
            </div>
          )}

          <div dir="ltr" className="grid lg:grid-cols-3 gap-6">

            {/* ── Left: Chart + History ──────────────────────────────── */}
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

                  {selectedCompany
                    ? <EChartsChart ticker={selectedCompany.ticker} />
                    : <div className="flex items-center justify-center h-[520px] bg-slate-50 rounded-xl text-slate-400 text-sm">
                        {sigsLoading ? <Loader2 className="w-8 h-8 animate-spin text-purple-400" /> : 'اختر شركة من القائمة'}
                      </div>
                  }


                  {/* Action buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'شراء',        icon: <ShoppingCart className="w-4 h-4 ml-1" />, cls: 'bg-emerald-600 hover:bg-emerald-700' },
                      { label: 'بيع',          icon: <TrendingDown  className="w-4 h-4 ml-1" />, cls: 'bg-red-600 hover:bg-red-700'         },
                      { label: 'إعادة شراء',  icon: <RotateCcw     className="w-4 h-4 ml-1" />, cls: 'bg-blue-600 hover:bg-blue-700'       },
                      { label: 'تغيير العقد', icon: <Plus          className="w-4 h-4 ml-1" />, cls: 'bg-purple-600 hover:bg-purple-700'   },
                    ].map(btn => (
                      <Button key={btn.label} className={`text-white text-sm ${btn.cls}`}>{btn.icon}{btn.label}</Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* History table */}
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="text-slate-500">📅</span>
                    جدول الكميات السابقة
                    {selectedCompany && <span className="text-sm font-normal text-slate-400 mr-2">— {selectedCompany.ticker}</span>}
                  </h3>
                  {sigsLoading
                    ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}</div>
                    : <div className="max-h-[25vh] overflow-y-auto"><HistoryTable rows={historyRows} /></div>
                  }
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
                  onChange={e => { setSearchQuery(e.target.value); setShowDropdown(e.target.value.trim().length > 0); }}
                  onFocus={() => setShowDropdown(searchQuery.trim().length > 0)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="بحث عن شركة أو رمز تداول..."
                  className="w-full pr-9 pl-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-slate-400"
                />
                {showDropdown && dropdownResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50 max-h-80 overflow-y-auto">
                    {dropdownResults.map(company => {
                      const isNotInCategory = !allCompaniesInCategories.some(c => c.ticker === company.ticker);
                      return (
                        <div
                          key={company.ticker}
                          onClick={() => { setSelectedCompany(company); setShowDropdown(false); }}
                          className={`border-b last:border-0 p-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${isNotInCategory ? 'bg-amber-50/50 hover:bg-amber-50' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <TickerLogo ticker={company.ticker} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-slate-900 text-sm">{company.ticker}</span>
                                {isNotInCategory && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold shrink-0">جديد</span>}
                                <SignalBadge signal={company.signal} />
                              </div>
                              <div className="flex items-center gap-1 flex-wrap text-xs">
                                <Badge className="bg-slate-100 text-slate-600 font-mono text-xs">{company.diffCategory}</Badge>
                                <span className={`font-semibold px-1.5 py-0.5 rounded-md font-mono text-xs ${company.loadDirection > 0 ? 'bg-emerald-50 text-emerald-700' : company.loadDirection < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
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
                  <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg z-50 p-3 text-center text-sm text-slate-500">لا توجد نتائج</div>
                )}
              </div>

              {/* ── CHANGE 3: Signal sub-filter buttons (after line 383) ── */}
              <div className="flex gap-1.5 mb-3">
                {([
                  { key: 'all',     label: 'الكل',   color: 'bg-slate-700 text-white',   inactive: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'    },
                  { key: 'accum',   label: 'تجميع', color: 'bg-emerald-600 text-white', inactive: 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50' },
                  { key: 'distrib', label: 'تصريف', color: 'bg-red-500 text-white',     inactive: 'bg-white text-red-600 border border-red-200 hover:bg-red-50'            },
                ] as const).map(f => {
                  const countDisplay = f.key === 'all' 
                    ? currentCategoryCompanies.length
                    : f.key === 'accum' 
                    ? accumCount
                    : distribCount;
                  
                  return (
                    <button
                      key={f.key}
                      onClick={() => setSignalFilter(f.key)}
                      className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${signalFilter === f.key ? f.color : f.inactive}`}
                    >
                      <span>{f.label}</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${signalFilter === f.key ? 'bg-white/25' : 'bg-slate-100'}`}>
                        {sigsLoading ? '…' : countDisplay}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                قائمة الشركات ({sigsLoading ? '…' : allInCategory.length})
              </p>

              <div className="overflow-y-auto flex-1 space-y-2 pl-0.5 pr-0.5">
                {sigsLoading && [1,2,3].map(i => (
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
                              <Badge className="bg-slate-100 text-slate-600 text-xs font-mono">{company.diffCategory}</Badge>
                            </div>
                            <div className="flex gap-1.5 items-center">
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md font-mono ${company.loadDirection > 0 ? 'bg-emerald-50 text-emerald-700' : company.loadDirection < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                                {company.loadDirection > 0 ? '+' : ''}{company.loadDirection}
                              </span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${company.perf5d?.startsWith('-') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                5d {company.perf5d === 'N/A' ? '—' : company.perf5d?.startsWith('-') ? company.perf5d : `+${company.perf5d}`}
                              </span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${company.perf3d?.startsWith('-') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
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
    </div>
  );
}