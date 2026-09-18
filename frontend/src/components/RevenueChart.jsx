import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatMonthLabel } from "../utils/formatters";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-white/10 text-xs">
      <div className="font-medium text-slate-300 pb-1.5 mb-1.5 border-b border-white/10 flex items-center justify-between gap-4">
        <span className="font-semibold text-white">{item.monthLabel}</span>
        <span className="font-mono text-slate-400 text-[11px]">{item.orders} orders</span>
      </div>
      <div className="font-bold text-violet-400 font-mono text-sm">
        {formatCurrency(item.revenue)}
      </div>
    </div>
  );
}

export default function RevenueChart({ data = [], loading = false }) {
  const [range, setRange] = useState("12M");

  // Parse and sort real chronological records
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const mapped = data.map((item) => {
      const monthRaw = item.REVENUE_MONTH || item.MONTH || "";
      const rev = Number(item.REVENUE ?? item.TOTAL_REVENUE ?? 0);
      const orders = Number(item.TOTAL_ORDERS ?? item.ORDERS ?? 0);

      return {
        monthRaw,
        monthLabel: formatMonthLabel(monthRaw),
        revenue: rev,
        orders,
        date: new Date(monthRaw),
      };
    });

    mapped.sort((a, b) => a.date - b.date);

    if (range === "6M") return mapped.slice(-6);
    if (range === "12M") return mapped.slice(-12);
    return mapped;
  }, [data, range]);

  // Real statistics computed directly from dynamic records
  const summary = useMemo(() => {
    if (!chartData.length) {
      return { total: 0, avg: 0, orders: 0, peakMonth: "-" };
    }
    const total = chartData.reduce((acc, c) => acc + c.revenue, 0);
    const orders = chartData.reduce((acc, c) => acc + c.orders, 0);
    const avg = total / chartData.length;
    const peak = chartData.reduce(
      (m, c) => (c.revenue > m.revenue ? c : m),
      chartData[0]
    );

    return {
      total,
      avg,
      orders,
      peakMonth: `${peak.monthLabel} (${formatCurrency(peak.revenue, true)})`,
    };
  }, [chartData]);

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/40 dark:border-white/[0.06] shadow-lg shadow-black/[0.03] h-[360px] flex items-center justify-center animate-pulse">
        <p className="text-xs text-slate-400 font-medium">Loading revenue data from Snowflake...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/40 dark:border-white/[0.06] shadow-lg shadow-black/[0.03] transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/30 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Monthly Revenue Trend
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/30 dark:border-white/10">
              dbt mart
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Billing run rate analyzed directly from <code className="text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-white/5 px-1 py-0.5 rounded text-[10.5px]">MONTHLY_REVENUE</code>
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 backdrop-blur-sm p-1 rounded-xl self-start sm:self-auto border border-white/30 dark:border-white/10">
          {[
            { key: "6M", label: "6M" },
            { key: "12M", label: "12M" },
            { key: "ALL", label: `All (${data.length})` },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                range === item.key
                  ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm shadow-black/5 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 my-4 px-4 bg-white/40 dark:bg-white/[0.03] rounded-xl border border-white/30 dark:border-white/[0.06] text-xs">
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider">Period Total:</span>
          <p className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm mt-0.5">
            {formatCurrency(summary.total)}
          </p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider">Monthly Average:</span>
          <p className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm mt-0.5">
            {formatCurrency(summary.avg, true)}
          </p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider">Total Orders:</span>
          <p className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm mt-0.5">
            {summary.orders.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider">Peak Month:</span>
          <p className="font-bold text-violet-600 dark:text-violet-400 font-mono text-sm mt-0.5 truncate">
            {summary.peakMonth}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full mt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No records returned by backend
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="#64748b"
                strokeOpacity={0.1}
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCurrency(val, true)}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                activeDot={{ r: 4, fill: "#8b5cf6" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}