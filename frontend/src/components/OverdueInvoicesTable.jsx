import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { formatCurrency, formatFullDate, getDaysOverdue } from "../utils/formatters";

export default function OverdueInvoicesTable({ invoices = [], loading = false }) {
  const [query, setQuery] = useState("");

  const totalOverdue = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + Number(inv.AMOUNT || 0), 0);
  }, [invoices]);

  const filtered = useMemo(() => {
    if (!invoices || !Array.isArray(invoices)) return [];
    if (!query.trim()) return invoices;
    const q = query.toLowerCase();
    return invoices.filter(
      (inv) =>
        String(inv.INVOICE_ID || "").includes(q) ||
        String(inv.CUSTOMER_ID || "").includes(q) ||
        (inv.CUSTOMER_NAME || "").toLowerCase().includes(q)
    );
  }, [invoices, query]);

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/40 dark:border-white/[0.06] shadow-lg shadow-black/[0.03] h-[380px] flex items-center justify-center animate-pulse">
        <p className="text-xs text-slate-400 font-medium">Loading overdue invoices...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/[0.06] shadow-lg shadow-black/[0.03] p-5 flex flex-col h-full transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200/30 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              Overdue Invoices
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300/20 dark:border-rose-500/15">
              {invoices.length} Overdue
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Aging receivables exceeding scheduled due dates
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400/70"
          />
          <input
            type="text"
            placeholder="Filter invoice/client..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-32 sm:w-44 pl-7 pr-2.5 py-1.5 text-xs bg-white/50 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10 focus:outline-none focus:border-violet-400/60 dark:focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 placeholder:text-slate-400/60 text-slate-900 dark:text-slate-100 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 dark:text-slate-500 font-medium">
              <th className="pb-2.5 pl-1 font-medium">Invoice ID</th>
              <th className="pb-2.5 font-medium">Customer ID</th>
              <th className="pb-2.5 font-medium text-center">Due Date</th>
              <th className="pb-2.5 font-medium text-center">Aging</th>
              <th className="pb-2.5 font-medium text-right pr-1">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  No overdue invoices found
                </td>
              </tr>
            ) : (
              filtered.slice(0, 10).map((inv) => {
                const days = getDaysOverdue(inv.DUE_DATE);
                const amt = Number(inv.AMOUNT || 0);

                return (
                  <tr
                    key={inv.INVOICE_ID}
                    className="hover:bg-violet-50/30 dark:hover:bg-violet-500/5 transition-colors duration-200"
                  >
                    <td className="py-2.5 pl-1 font-mono font-medium text-slate-900 dark:text-slate-100">
                      INV-{String(inv.INVOICE_ID).padStart(4, "0")}
                    </td>
                    <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300">
                      {inv.CUSTOMER_NAME ? (
                        <span>{inv.CUSTOMER_NAME}</span>
                      ) : (
                        <span>Account #{inv.CUSTOMER_ID}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center text-slate-600 dark:text-slate-400 font-mono">
                      {formatFullDate(inv.DUE_DATE)}
                    </td>
                    <td className="py-2.5 text-center font-mono">
                      <span className="inline-block px-1.5 py-0.5 rounded-lg text-[10.5px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300/20 dark:border-rose-500/15">
                        {days > 0 ? `${days}d past due` : "Due today"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-1 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(amt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-200/30 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Total Uncollected Receivables:</span>
        <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">
          {formatCurrency(totalOverdue)}
        </span>
      </div>
    </div>
  );
}