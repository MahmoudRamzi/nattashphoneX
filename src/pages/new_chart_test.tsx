import { useState, useEffect, useRef, useCallback } from "react";
import {
  createChart,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  LineStyle,
} from "lightweight-charts";
import { loadSession } from "@/hooks/useAuth";
import type { UTCTimestamp } from "lightweight-charts";

const API_BASE = "https://app.qafah.com";

interface TickerRecord {
  holding_ticker: string;
  load: number;
  DiffCategory_1d: string;
  resell_signal_4: boolean;
  resell_counter_4: number;
  resell_internal_signal_4: boolean;
  resell_internal_4: number;
  high_3: number;
  low_3: number;
  high_4: number;
  low_4: number;
  date: string;
  close: number;
  load_level_state: string;
  load_direction: number;
  level_type: string;
  LoadChangePerc_5d: string;
  LoadChangePerc_3d: string;
}

interface OhlcCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}


function toUnixTimestamp(timeStr: string): UTCTimestamp {
  return Math.floor(new Date(timeStr).getTime() / 1000) as UTCTimestamp;
}

const STATE_COLORS: Record<string, string> = {
  accumulation: "#22c55e",
  distribution: "#ef4444",
  "pre-distribution": "#f97316",
  "pre-accumulation": "#3b82f6",
  neutral: "#6b7280",
};

const LEVEL_TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  continuous: { bg: "bg-purple-500/20", text: "text-purple-400" },
  secondary_change: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  direction_change: { bg: "bg-blue-500/20", text: "text-blue-400" },
  none: { bg: "bg-gray-500/20", text: "text-gray-400" },
};

const DIFF_COLORS: Record<string, string> = {
  "Super Major": "#dc2626",
  Major: "#ea580c",
  "Super High": "#ca8a04",
  High: "#65a30d",
  Mid: "#0891b2",
  Minor: "#7c3aed",
  Negligible: "#6b7280",
  "No Change": "#374151",
  "N/A": "#374151",
};

const PERIODS = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1d"] as const;
type Period = (typeof PERIODS)[number];

function OhlcChart({
  ticker,
  records,
  ohlcData,
}: {
  ticker: string;
  records: TickerRecord[];
  ohlcData: OhlcCandle[];
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const container = chartRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: "#0a0f1e" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#1e293b" },
      timeScale: { borderColor: "#1e293b", timeVisible: true, secondsVisible: false },
    });

    if (ohlcData.length > 0) {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        title: ticker,
      });

      candleSeries.setData(
        ohlcData.map((c) => ({
          time: toUnixTimestamp(c.time),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      const volSeries = chart.addSeries(HistogramSeries, {
        color: "#334155",
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });
      volSeries.setData(
        ohlcData.map((c) => ({
          time: toUnixTimestamp(c.time),
          value: c.volume,
          color: c.close >= c.open ? "#22c55e33" : "#ef444433",
        }))
      );

      const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
      const markers: any[] = [];
      sorted.forEach((r) => {
        const dateKey = r.date.split("T")[0];
        const match = ohlcData.find((c) => c.time.startsWith(dateKey));
        if (!match) return;
        if (r.resell_signal_4) {
          markers.push({
            time: toUnixTimestamp(match.time),
            position: r.resell_counter_4 > 0 ? "belowBar" : "aboveBar",
            color: r.resell_counter_4 > 0 ? "#22c55e" : "#ef4444",
            shape: r.resell_counter_4 > 0 ? "arrowUp" : "arrowDown",
            text: `R${Math.abs(r.resell_counter_4)}`,
            size: 1,
          });
        } else if (r.resell_internal_signal_4) {
          markers.push({
            time: toUnixTimestamp(match.time),
            position: r.resell_internal_4 > 0 ? "belowBar" : "aboveBar",
            color: r.resell_internal_4 > 0 ? "#86efac" : "#fca5a5",
            shape: "circle",
            text: `i${Math.abs(r.resell_internal_4)}`,
            size: 0.5,
          });
        }
      });
      if (markers.length > 0) createSeriesMarkers(candleSeries, markers);

    } else if (records.length > 0) {
      const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
      const closeSeries = chart.addSeries(LineSeries, {
        color: "#60a5fa",
        lineWidth: 2,
        title: "Close",
      });
      closeSeries.setData(
        sorted
          .filter((r) => r.close != null && isFinite(r.close))
          .map((r) => ({ time: toUnixTimestamp(r.date), value: r.close }))
      );
    }

    if (records.length > 0) {
      const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

      const loadSeries = chart.addSeries(LineSeries, {
        color: "#a78bfa",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: "Load",
        priceScaleId: "load",
      });
      chart.priceScale("load").applyOptions({
        scaleMargins: { top: 0.75, bottom: 0.15 },
      });

      const cleanLine = (key: keyof TickerRecord) =>
        sorted
          .filter(
            (r) =>
              r[key] != null &&
              typeof r[key] === "number" &&
              isFinite(r[key] as number)
          )
          .map((r) => ({ time: toUnixTimestamp(r.date), value: r[key] as number }));

      loadSeries.setData(cleanLine("load"));
      chart
        .addSeries(LineSeries, {
          color: "#22c55e",
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          title: "H4",
          priceScaleId: "load",
        })
        .setData(cleanLine("high_4"));
      chart
        .addSeries(LineSeries, {
          color: "#ef4444",
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          title: "L4",
          priceScaleId: "load",
        })
        .setData(cleanLine("low_4"));
    }

    const ro = new ResizeObserver(() => {
      if (container) chart.resize(container.clientWidth, 420);
    });
    ro.observe(container);
    chart.timeScale().fitContent();

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [ticker, records, ohlcData]);

  return <div ref={chartRef} className="w-full" />;
}

function CounterBar({ value }: { value: number }) {
  const abs = Math.min(Math.abs(value), 10);
  const isPos = value >= 0;
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: abs }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-sm ${isPos ? "bg-green-500" : "bg-red-500"}`}
            style={{ opacity: 0.4 + (i / Math.max(abs, 1)) * 0.6 }}
          />
        ))}
      </div>
      <span
        className={`text-xs font-mono font-bold ${isPos ? "text-green-400" : "text-red-400"}`}
      >
        {value > 0 ? "+" : ""}
        {value}
      </span>
    </div>
  );
}

function TickerCard({
  ticker,
  records,
}: {
  ticker: string;
  records: TickerRecord[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [period, setPeriod] = useState<Period>("1d");
  const [ohlcData, setOhlcData] = useState<OhlcCandle[]>([]);
  const [ohlcLoading, setOhlcLoading] = useState(false);
  const [ohlcError, setOhlcError] = useState<string | null>(null);

  const latest = records[records.length - 1];
  if (!latest) return null;

  const stateColor = STATE_COLORS[latest.load_level_state] ?? "#6b7280";
  const levelBadge = LEVEL_TYPE_BADGE[latest.level_type] ?? LEVEL_TYPE_BADGE.none;
  const diffColor = DIFF_COLORS[latest.DiffCategory_1d] ?? "#6b7280";

  const fetchOhlc = useCallback(
    async (p: Period) => {
      setOhlcLoading(true);
      setOhlcError(null);
      try {
        const session = loadSession();
        if (!session?.token) throw new Error("Not authenticated");
        const res = await fetch(
          `${API_BASE}/api/ohlc?ticker=${encodeURIComponent(ticker)}&period=${p}&limit=300`,
          { headers: { Authorization: `Bearer ${session.token}` } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setOhlcData(await res.json());
      } catch (e: any) {
        setOhlcError(e.message);
        setOhlcData([]);
      } finally {
        setOhlcLoading(false);
      }
    },
    [ticker]
  );

  useEffect(() => {
    if (expanded && ohlcData.length === 0 && !ohlcError) fetchOhlc(period);
  }, [expanded]);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    fetchOhlc(p);
  };

  // Format datetime for display: "2024-12-17 05:00" style
  const fmtTime = (t: string) => {
    if (!t) return "";
    const d = new Date(t);
    if (isNaN(d.getTime())) return t.slice(0, 16);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono font-bold text-white text-lg">{ticker}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelBadge.bg} ${levelBadge.text}`}
          >
            {latest.level_type}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: `${stateColor}22`, color: stateColor }}
          >
            {latest.load_level_state}
          </span>
          {latest.resell_signal_4 && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">
              ★ Signal
            </span>
          )}
          {latest.resell_internal_signal_4 && (
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-bold">
              ◆ Internal
            </span>
          )}
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <div className="text-white font-mono font-bold">
              ${latest.close?.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400">Close</div>
          </div>
          <div className="text-right">
            <div className="text-purple-300 font-mono text-sm">
              {latest.load?.toFixed(4)}
            </div>
            <div className="text-xs text-slate-400">Load</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold" style={{ color: diffColor }}>
              {latest.DiffCategory_1d}
            </div>
            <div className="text-xs text-slate-400">1d Diff</div>
          </div>
          <div className="text-slate-400 text-xs w-4">{expanded ? "▲" : "▼"}</div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700/50">
          <div className="p-4 bg-slate-900/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide mr-1">
                Period:
              </span>
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    period === p
                      ? "bg-purple-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
              {ohlcLoading && (
                <span className="text-xs text-slate-400 animate-pulse ml-2">
                  Loading candles…
                </span>
              )}
              {ohlcError && (
                <span className="text-xs text-red-400 ml-2">⚠ {ohlcError}</span>
              )}
              {!ohlcLoading && ohlcData.length > 0 && (
                <span className="text-xs text-slate-500 ml-auto">
                  {ohlcData.length} candles · {fmtTime(ohlcData[0]?.time)} →{" "}
                  {fmtTime(ohlcData.at(-1)?.time ?? "")}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Candlestick (OHLC) · Volume (bottom) · Load/H4/L4 bands (dashed overlay) ·
              Arrows = resell signals
            </p>
            {ohlcLoading ? (
              <div className="h-[420px] flex items-center justify-center text-slate-500 animate-pulse text-sm">
                ⟳ Loading OHLC data…
              </div>
            ) : (
              <OhlcChart ticker={ticker} records={records} ohlcData={ohlcData} />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-4">
            <div className="bg-slate-900/60 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2">Resell Counter</div>
              <CounterBar value={latest.resell_counter_4} />
              <div className="mt-1 text-xs text-slate-500">
                Signal:{" "}
                <span
                  className={
                    latest.resell_signal_4 ? "text-yellow-400" : "text-slate-600"
                  }
                >
                  {latest.resell_signal_4 ? "✓ Active" : "—"}
                </span>
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2">Internal Signal</div>
              <CounterBar value={latest.resell_internal_4} />
              <div className="mt-1 text-xs text-slate-500">
                Signal:{" "}
                <span
                  className={
                    latest.resell_internal_signal_4
                      ? "text-orange-400"
                      : "text-slate-600"
                  }
                >
                  {latest.resell_internal_signal_4 ? "✓ Active" : "—"}
                </span>
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2">Load Bands</div>
              <div className="space-y-1">
                {[
                  { label: "H4", val: latest.high_4, color: "text-green-400" },
                  { label: "L4", val: latest.low_4, color: "text-red-400" },
                  { label: "H3", val: latest.high_3, color: "text-green-300" },
                  { label: "L3", val: latest.low_3, color: "text-red-300" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className={color}>{label}</span>
                    <span className="font-mono text-white">{val?.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2">Load % Changes</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">3d</span>
                  <span className="font-mono text-blue-300">{latest.LoadChangePerc_3d}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">5d</span>
                  <span className="font-mono text-blue-300">{latest.LoadChangePerc_5d}</span>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-slate-400">Direction</span>
                  <span
                    className={`font-mono font-bold ${
                      latest.load_direction > 0
                        ? "text-green-400"
                        : latest.load_direction < 0
                        ? "text-red-400"
                        : "text-slate-400"
                    }`}
                  >
                    {latest.load_direction > 0
                      ? "↑"
                      : latest.load_direction < 0
                      ? "↓"
                      : "—"}{" "}
                    {latest.load_direction}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">
              Recent 15 Records
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 bg-slate-900/60">
                    {[
                      "Date",
                      "Close",
                      "Load",
                      "H4",
                      "L4",
                      "Counter",
                      "Internal",
                      "State",
                      "1d Diff",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`py-2 px-3 ${h === "Date" ? "text-left" : "text-right"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records
                    .slice(-15)
                    .reverse()
                    .map((r, i) => (
                      <tr
                        key={i}
                        className={`border-t border-slate-800 ${
                          r.resell_signal_4
                            ? "bg-yellow-500/5"
                            : i % 2 === 0
                            ? "bg-slate-900/20"
                            : ""
                        }`}
                      >
                        <td className="py-1.5 px-3 text-slate-300 font-mono">{r.date}</td>
                        <td className="text-right px-3 font-mono text-white">
                          {r.close?.toFixed(2)}
                        </td>
                        <td className="text-right px-3 font-mono text-purple-300">
                          {r.load?.toFixed(4)}
                        </td>
                        <td className="text-right px-3 font-mono text-green-400">
                          {r.high_4?.toFixed(4)}
                        </td>
                        <td className="text-right px-3 font-mono text-red-400">
                          {r.low_4?.toFixed(4)}
                        </td>
                        <td
                          className={`text-right px-3 font-mono font-bold ${
                            r.resell_counter_4 > 0
                              ? "text-green-400"
                              : r.resell_counter_4 < 0
                              ? "text-red-400"
                              : "text-slate-500"
                          }`}
                        >
                          {r.resell_counter_4 > 0 ? "+" : ""}
                          {r.resell_counter_4}
                          {r.resell_signal_4 && (
                            <span className="ml-1 text-yellow-400">★</span>
                          )}
                        </td>
                        <td
                          className={`text-right px-3 font-mono ${
                            r.resell_internal_4 > 0
                              ? "text-green-300"
                              : r.resell_internal_4 < 0
                              ? "text-red-300"
                              : "text-slate-500"
                          }`}
                        >
                          {r.resell_internal_4 > 0 ? "+" : ""}
                          {r.resell_internal_4}
                          {r.resell_internal_signal_4 && (
                            <span className="ml-1 text-orange-400">◆</span>
                          )}
                        </td>
                        <td className="text-right px-3">
                          <span
                            className="px-1.5 py-0.5 rounded text-xs"
                            style={{
                              background: `${
                                STATE_COLORS[r.load_level_state] ?? "#6b7280"
                              }22`,
                              color: STATE_COLORS[r.load_level_state] ?? "#6b7280",
                            }}
                          >
                            {r.load_level_state}
                          </span>
                        </td>
                        <td
                          className="text-right px-3 font-semibold"
                          style={{ color: DIFF_COLORS[r.DiffCategory_1d] ?? "#6b7280" }}
                        >
                          {r.DiffCategory_1d}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBar({ data }: { data: TickerRecord[] }) {
  const latest = Object.values(
    data.reduce((acc, r) => {
      if (!acc[r.holding_ticker] || r.date > acc[r.holding_ticker].date)
        acc[r.holding_ticker] = r;
      return acc;
    }, {} as Record<string, TickerRecord>)
  );
  const stats = [
    {
      label: "Accumulation",
      value: latest.filter((r) => r.load_level_state === "accumulation").length,
      color: "#22c55e",
    },
    {
      label: "Distribution",
      value: latest.filter((r) => r.load_level_state === "distribution").length,
      color: "#ef4444",
    },
    {
      label: "Pre-Accum",
      value: latest.filter((r) => r.load_level_state === "pre-accumulation").length,
      color: "#3b82f6",
    },
    {
      label: "Pre-Dist",
      value: latest.filter((r) => r.load_level_state === "pre-distribution").length,
      color: "#f97316",
    },
    {
      label: "Active Signals",
      value: latest.filter((r) => r.resell_signal_4).length,
      color: "#facc15",
    },
    {
      label: "Internal Sigs",
      value: latest.filter((r) => r.resell_internal_signal_4).length,
      color: "#a78bfa",
    },
    {
      label: "Continuous",
      value: latest.filter((r) => r.level_type === "continuous").length,
      color: "#e879f9",
    },
  ];
  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center"
        >
          <div
            className="text-2xl font-bold font-mono"
            style={{ color: s.color }}
          >
            {s.value}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function TickerResellSignals_test() {
  const [data, setData] = useState<TickerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickerInput, setTickerInput] = useState("");
  const [mode, setMode] = useState<"cached" | "recalc">("cached");
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [onlySignals, setOnlySignals] = useState(false);
  const [sortBy, setSortBy] = useState<"ticker" | "counter" | "state">("ticker");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tickers = tickerInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const params = new URLSearchParams({ mode });
      tickers.forEach((t) => params.append("tickers", t));
      const session = loadSession();
      if (!session?.token)
        throw new Error("Not authenticated — please log in again.");
      const res = await fetch(
        `${API_BASE}/api/ticker_resell_signals?${params}`,
        { headers: { Authorization: `Bearer ${session.token}` } }
      );
      if (!res.ok) {
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("text/html"))
          throw new Error(`HTTP ${res.status} — session expired?`);
        throw new Error(`HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tickerInput, mode]);

  useEffect(() => {
    fetchData();
  }, []);

  const grouped = data.reduce((acc, r) => {
    if (!acc[r.holding_ticker]) acc[r.holding_ticker] = [];
    acc[r.holding_ticker].push(r);
    return acc;
  }, {} as Record<string, TickerRecord[]>);

  const latestByTicker = Object.fromEntries(
    Object.entries(grouped).map(([ticker, recs]) => [
      ticker,
      recs.sort((a, b) => a.date.localeCompare(b.date)).at(-1)!,
    ])
  );

  let tickers = Object.keys(grouped).filter((t) => {
    const lat = latestByTicker[t];
    if (search && !t.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterState !== "all" && lat.load_level_state !== filterState) return false;
    if (filterLevel !== "all" && lat.level_type !== filterLevel) return false;
    if (onlySignals && !lat.resell_signal_4 && !lat.resell_internal_signal_4)
      return false;
    return true;
  });

  tickers.sort((a, b) => {
    const la = latestByTicker[a],
      lb = latestByTicker[b];
    if (sortBy === "counter")
      return Math.abs(lb.resell_counter_4) - Math.abs(la.resell_counter_4);
    if (sortBy === "state")
      return la.load_level_state.localeCompare(lb.load_level_state);
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="border-b border-slate-700/50 bg-slate-800/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-white">
              📊 Resell Signals Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              {data.length.toLocaleString()} records · {Object.keys(grouped).length}{" "}
              tickers
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <input
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-400 w-52 focus:outline-none focus:border-purple-500"
              placeholder="Filter tickers (AAPL,MSFT,…)"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
            />
            <select
              className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <option value="cached">Cached</option>
              <option value="recalc">Recalculate</option>
            </select>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? "Loading…" : "⟳ Fetch"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            ⚠ {error}
          </div>
        )}
        {data.length > 0 && (
          <>
            <SummaryBar data={data} />
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <input
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-40"
                placeholder="Search ticker…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
              >
                <option value="all">All States</option>
                {[
                  "accumulation",
                  "distribution",
                  "pre-accumulation",
                  "pre-distribution",
                  "neutral",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="all">All Level Types</option>
                {["continuous", "secondary_change", "direction_change", "none"].map(
                  (l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  )
                )}
              </select>
              <select
                className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="ticker">Sort: Ticker A–Z</option>
                <option value="counter">Sort: Counter |abs|</option>
                <option value="state">Sort: State</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlySignals}
                  onChange={(e) => setOnlySignals(e.target.checked)}
                  className="accent-purple-500"
                />
                Active signals only
              </label>
              <span className="ml-auto text-xs text-slate-500 font-mono">
                {tickers.length}/{Object.keys(grouped).length} shown
              </span>
            </div>
            <div className="space-y-2">
              {tickers.map((ticker) => (
                <TickerCard
                  key={ticker}
                  ticker={ticker}
                  records={grouped[ticker].sort((a, b) =>
                    a.date.localeCompare(b.date)
                  )}
                />
              ))}
              {tickers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No tickers match the current filters.
                </div>
              )}
            </div>
          </>
        )}
        {!loading && data.length === 0 && !error && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-slate-400 text-lg">
              Click{" "}
              <span className="text-purple-400 font-semibold">⟳ Fetch</span> to
              load ticker resell signals
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Optionally specify tickers like AAPL,MSFT in the header input
            </p>
          </div>
        )}
        {loading && (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg animate-pulse">
              ⟳ Loading & computing signals…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}