import { RefreshCw, ArrowLeft } from "lucide-react";

export default function Header({
  activeTab = "dashboard",
  onTabChange = () => {},
  onRefresh,
  refreshing = false,
  lastUpdated,
  backendOnline = true,
}) {
  const titles = {
    dashboard: "Overview Dashboard",
    revenue: "Monthly Revenue Mart",
    customers: "Top Enterprise Customers",
    inventory: "Inventory & Stock Health",
    invoices: "Overdue Receivables",
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-3">
          {activeTab !== "dashboard" && (
            <button
              onClick={() => onTabChange("dashboard")}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Back to Overview"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {titles[activeTab] || "ERP Analytics Dashboard"}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              backendOnline
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            {backendOnline ? "Live API Connected" : "API Offline"}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Real-time enterprise metrics directly from Snowflake analytics warehouse
        </p>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-slate-400 font-mono">
            Synced: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            size={13}
            className={refreshing ? "animate-spin text-slate-900" : "text-slate-500"}
          />
          <span>{refreshing ? "Fetching..." : "Refresh"}</span>
        </button>
      </div>
    </header>
  );
}
