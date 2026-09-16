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
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-800 text-xs">
      <div className="font-medium text-slate-300 pb-1 mb-1 border-b border-slate-800 flex justify-between gap-4">
        <span>{item.monthLabel}</span>
        <span className="font-mono text-slate-400">{item.orders} orders</span>
      </div>
      <div className="font-bold text-indigo-300 font-mono text-sm">
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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs h-[360px] flex items-center justify-center">
        <p className="text-xs text-slate-400 font-medium">Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
            Monthly Revenue Trend
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical billing stream directly from <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[11px]">MONTHLY_REVENUE</code>
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
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
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 my-4 px-4 bg-slate-50/60 rounded-lg border border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 font-medium">Period Total:</span>
          <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">
            {formatCurrency(summary.total)}
          </p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Monthly Average:</span>
          <p className="font-bold text-slate-800 font-mono text-sm mt-0.5">
            {formatCurrency(summary.avg, true)}
          </p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Total Orders:</span>
          <p className="font-bold text-slate-800 font-mono text-sm mt-0.5">
            {summary.orders.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Peak Month:</span>
          <p className="font-bold text-indigo-600 font-mono text-sm mt-0.5 truncate">
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
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                dy={6}
              />
              <YAxis
                stroke="#94a3b8"
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
                stroke="#4f46e5"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                activeDot={{ r: 5, fill: "#4f46e5" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}