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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs h-[380px] flex items-center justify-center">
        <p className="text-xs text-slate-400 font-medium">Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Inventory & Stock Status
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {inventory.length} SKUs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stock levels evaluated against safety reorder thresholds
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
            placeholder="Filter product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-32 sm:w-40 pl-7 pr-2.5 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 transition-colors placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-3 text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
            filter === "all"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          All ({inventory.length})
        </button>
        <button
          onClick={() => setFilter("reorder")}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
            filter === "reorder"
              ? "bg-rose-600 text-white"
              : "text-rose-600 hover:bg-rose-50"
          }`}
        >
          Reorder Required ({reorderItems.length})
        </button>
        <button
          onClick={() => setFilter("healthy")}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
            filter === "healthy"
              ? "bg-emerald-600 text-white"
              : "text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          Healthy ({inventory.length - reorderItems.length})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-medium">
              <th className="pb-2.5 pl-1 font-medium">Product / SKU</th>
              <th className="pb-2.5 font-medium text-center">Current Stock</th>
              <th className="pb-2.5 font-medium text-center">Reorder Level</th>
              <th className="pb-2.5 font-medium text-right pr-1">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
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
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2.5 pl-1">
                      <div className="font-medium text-slate-900">
                        {item.PRODUCT_NAME}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SKU #{item.PRODUCT_ID}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono font-semibold text-slate-800">
                      {formatNumber(stock)}
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-500">
                      {formatNumber(reorder)}
                    </td>
                    <td className="py-2.5 pr-1 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          isReorder
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
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
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {Math.min(filtered.length, 10)} of {inventory.length} items</span>
        <span className="font-mono text-slate-700">
          Reorders: {reorderItems.length}
        </span>
      </div>
    </div>
  );
}