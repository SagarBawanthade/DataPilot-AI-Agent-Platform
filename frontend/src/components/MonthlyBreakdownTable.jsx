import { useMemo } from "react";
import { formatCurrency, formatMonthLabel } from "../utils/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MonthlyBreakdownTable({ data = [], loading = false }) {
  // Sort latest first for tabular breakdown
  const sortedRecords = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const list = [...data];
    list.sort((a, b) => {
      const dateA = new Date(a.REVENUE_MONTH || a.MONTH || 0);
      const dateB = new Date(b.REVENUE_MONTH || b.MONTH || 0);
      return dateB - dateA;
    });
    return list;
  }, [data]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs h-[300px] flex items-center justify-center animate-pulse">
        <p className="text-xs text-slate-400 font-medium">Loading monthly records from Snowflake...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-5 flex flex-col transition-colors">
      <div className="pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Monthly Ledger Breakdown
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {sortedRecords.length} Periods
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed monthly billing and volume from Snowflake
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-medium">
              <th className="pb-2.5 pl-1 font-medium">Billing Period</th>
              <th className="pb-2.5 font-medium text-center">Orders</th>
              <th className="pb-2.5 font-medium text-right">Avg / Order</th>
              <th className="pb-2.5 font-medium text-right">MoM Growth</th>
              <th className="pb-2.5 font-medium text-right pr-1">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {sortedRecords.map((item, index) => {
              const rev = Number(item.REVENUE ?? item.TOTAL_REVENUE ?? 0);
              const orders = Number(item.TOTAL_ORDERS ?? item.ORDERS ?? 0);
              const avg = orders > 0 ? rev / orders : 0;
              const nextItem = sortedRecords[index + 1];
              const nextRev = nextItem ? Number(nextItem.REVENUE ?? nextItem.TOTAL_REVENUE ?? 0) : null;
              const growth = nextRev && nextRev > 0 ? ((rev - nextRev) / nextRev) * 100 : null;

              return (
                <tr key={item.REVENUE_MONTH || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 pl-1 font-medium text-slate-900 dark:text-slate-100">
                    {formatMonthLabel(item.REVENUE_MONTH || item.MONTH)}
                  </td>
                  <td className="py-2.5 text-center font-mono text-slate-600 dark:text-slate-400">
                    {orders.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                    {formatCurrency(avg, true)}
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    {growth !== null ? (
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                          growth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {Math.abs(growth).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 font-mono">-</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-1 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(rev)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
