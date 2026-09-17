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
    <div className="bg-slate-900 dark:bg-slate-950 text-white px-3.5 py-2.5 rounded-lg shadow-xl border border-slate-700 dark:border-slate-800 text-xs">
      <div className="font-medium text-slate-300 pb-1.5 mb-1.5 border-b border-slate-800 flex items-center justify-between gap-4">
        <span className="font-semibold text-white">{item.monthLabel}</span>
        <span className="font-mono text-slate-400 text-[11px]">{item.orders} orders</span>
      </div>
      <div className="font-bold text-indigo-400 font-mono text-sm">
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
      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs h-[360px] flex items-center justify-center animate-pulse">
        <p className="text-xs text-slate-400 font-medium">Loading revenue data from Snowflake...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] p-5 sm:p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Monthly Revenue Trend
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              dbt mart
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Billing run rate analyzed directly from <code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10.5px]">MONTHLY_REVENUE</code>
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
          {[
            { key: "6M", label: "6M" },
            { key: "12M", label: "12M" },
            { key: "ALL", label: `All (${data.length})` },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                range === item.key
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 my-4 px-4 bg-slate-50/80 dark:bg-slate-850/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
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
          <p className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm mt-0.5 truncate">
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
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="#64748b"
                strokeOpacity={0.15}
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
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                activeDot={{ r: 4, fill: "#6366f1" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}