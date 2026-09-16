import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

export default function TopCustomersTable({ customers = [], loading = false }) {
  const [query, setQuery] = useState("");

  const totalRev = useMemo(() => {
    return customers.reduce((sum, c) => sum + Number(c.TOTAL_REVENUE || 0), 0);
  }, [customers]);

  const filtered = useMemo(() => {
    if (!customers || !Array.isArray(customers)) return [];
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        (c.CUSTOMER_NAME || "").toLowerCase().includes(q) ||
        String(c.CUSTOMER_ID || "").includes(q)
    );
  }, [customers, query]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs h-[380px] flex items-center justify-center">
        <p className="text-xs text-slate-400 font-medium">Loading customer accounts...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Top Enterprise Customers
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {customers.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by aggregate revenue from Snowflake mart
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Filter..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-32 sm:w-40 pl-7 pr-2.5 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 transition-colors placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-medium">
              <th className="pb-2.5 pl-1 font-medium w-8">#</th>
              <th className="pb-2.5 font-medium">Customer</th>
              <th className="pb-2.5 font-medium text-center w-20">Orders</th>
              <th className="pb-2.5 font-medium text-right pr-1">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No accounts match filter
                </td>
              </tr>
            ) : (
              filtered.map((c, index) => {
                const rev = Number(c.TOTAL_REVENUE || 0);
                const sharePercent = totalRev > 0 ? ((rev / totalRev) * 100).toFixed(1) : 0;

                return (
                  <tr key={c.CUSTOMER_ID || index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 pl-1 font-mono text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-2.5">
                      <div className="font-medium text-slate-900">
                        {c.CUSTOMER_NAME}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {c.CUSTOMER_ID}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-600">
                      {c.TOTAL_ORDERS || 0}
                    </td>
                    <td className="py-2.5 pr-1 text-right font-mono">
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(rev)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {sharePercent}% of top 10
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Combined Volume:</span>
        <span className="font-bold text-slate-900 font-mono">
          {formatCurrency(totalRev)}
        </span>
      </div>
    </div>
  );
}