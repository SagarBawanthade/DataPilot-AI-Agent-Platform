import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { formatNumber } from "../utils/formatters";

export default function InventoryTable({ inventory = [], loading = false }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const reorderItems = useMemo(() => {
    return inventory.filter(
      (item) =>
        (item.STOCK_STATUS || "").toUpperCase() === "REORDER" ||
        Number(item.CURRENT_STOCK ?? 0) <= Number(item.REORDER_LEVEL ?? 0)
    );
  }, [inventory]);

  const filtered = useMemo(() => {
    if (!inventory || !Array.isArray(inventory)) return [];

    return inventory.filter((item) => {
      const name = (item.PRODUCT_NAME || "").toLowerCase();
      const id = String(item.PRODUCT_ID || "");
      const matchesSearch =
        !query.trim() || name.includes(query.toLowerCase()) || id.includes(query);

      const isReorder =
        (item.STOCK_STATUS || "").toUpperCase() === "REORDER" ||
        Number(item.CURRENT_STOCK ?? 0) <= Number(item.REORDER_LEVEL ?? 0);

      if (!matchesSearch) return false;
      if (filter === "reorder") return isReorder;
      if (filter === "healthy") return !isReorder;
      return true;
    });
  }, [inventory, query, filter]);

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/40 dark:border-white/[0.06] shadow-lg shadow-black/[0.03] h-[380px] flex items-center justify-center animate-pulse">
        <p className="text-xs text-slate-400 font-medium">Loading inventory data...</p>
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
              Inventory & Stock Status
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/30 dark:border-white/10">
              {inventory.length} SKUs
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Stock levels evaluated against safety reorder thresholds
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
            placeholder="Filter product/SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-32 sm:w-44 pl-7 pr-2.5 py-1.5 text-xs bg-white/50 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10 focus:outline-none focus:border-violet-400/60 dark:focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200 placeholder:text-slate-400/60 text-slate-900 dark:text-slate-100 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 text-xs flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer border ${
            filter === "all"
              ? "bg-white/70 dark:bg-white/10 text-slate-900 dark:text-white border-white/40 dark:border-white/15 shadow-sm shadow-black/5 font-semibold backdrop-blur-sm"
              : "text-slate-600 dark:text-slate-400 border-white/20 dark:border-white/[0.06] hover:bg-white/30 dark:hover:bg-white/5"
          }`}
        >
          All ({inventory.length})
        </button>
        <button
          onClick={() => setFilter("reorder")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer border ${
            filter === "reorder"
              ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300/30 dark:border-rose-500/20 shadow-sm shadow-rose-500/5 font-semibold"
              : "text-rose-600 dark:text-rose-400 border-rose-200/30 dark:border-rose-500/10 hover:bg-rose-50/30 dark:hover:bg-rose-500/5"
          }`}
        >
          Reorder Required ({reorderItems.length})
        </button>
        <button
          onClick={() => setFilter("healthy")}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer border ${
            filter === "healthy"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300/30 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/5 font-semibold"
              : "text-emerald-700 dark:text-emerald-400 border-emerald-200/30 dark:border-emerald-500/10 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5"
          }`}
        >
          Healthy ({inventory.length - reorderItems.length})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 dark:text-slate-500 font-medium">
              <th className="pb-2.5 pl-1 font-medium">Product / SKU</th>
              <th className="pb-2.5 font-medium text-center">Current Stock</th>
              <th className="pb-2.5 font-medium text-center">Reorder Level</th>
              <th className="pb-2.5 font-medium text-right pr-1">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  No inventory items match filter
                </td>
              </tr>
            ) : (
              filtered.slice(0, 10).map((item) => {
                const stock = Number(item.CURRENT_STOCK ?? 0);
                const reorder = Number(item.REORDER_LEVEL ?? 0);
                const isReorder =
                  (item.STOCK_STATUS || "").toUpperCase() === "REORDER" ||
                  stock <= reorder;

                return (
                  <tr
                    key={item.PRODUCT_ID}
                    className="hover:bg-violet-50/30 dark:hover:bg-violet-500/5 transition-colors duration-200"
                  >
                    <td className="py-2.5 pl-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {item.PRODUCT_NAME}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        SKU #{item.PRODUCT_ID}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatNumber(stock)}
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-500 dark:text-slate-400">
                      {formatNumber(reorder)}
                    </td>
                    <td className="py-2.5 pr-1 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                          isReorder
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300/20 dark:border-rose-500/15"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300/20 dark:border-emerald-500/15"
                        }`}
                      >
                        {item.STOCK_STATUS || (isReorder ? "REORDER" : "HEALTHY")}
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
      <div className="mt-3 pt-3 border-t border-slate-200/30 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Showing {Math.min(filtered.length, 10)} of {inventory.length} items</span>
        <span className="font-mono text-slate-700 dark:text-slate-300">
          Reorders: {reorderItems.length}
        </span>
      </div>
    </div>
  );
}