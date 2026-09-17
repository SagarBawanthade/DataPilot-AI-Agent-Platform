import { RefreshCw, ArrowLeft, Sparkles, Sun, Moon, Clock } from "lucide-react";

export default function Header({
  activeTab = "dashboard",
  onTabChange = () => {},
  onRefresh,
  refreshing = false,
  lastUpdated,
  backendOnline = true,
  onOpenCopilot = () => {},
  theme = "dark",
  onToggleTheme = () => {},
}) {
  const titles = {
    dashboard: "Overview Dashboard",
    revenue: "Monthly Revenue Mart",
    customers: "Top Enterprise Customers",
    inventory: "Inventory & Stock Health",
    invoices: "Overdue Receivables",
    copilot: "ERP AI Copilot Assistant",
  };

  const breadcrumbs = {
    dashboard: "Workspace / Overview",
    revenue: "Marts / Monthly Revenue",
    customers: "Marts / Top Customers",
    inventory: "Marts / Inventory Health",
    invoices: "Marts / Overdue Invoices",
    copilot: "Intelligence / Copilot Assistant",
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-7 border-b border-slate-200/90 dark:border-slate-800/80 transition-colors">
      <div>
        {/* Breadcrumb path */}
        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
          <span>{breadcrumbs[activeTab] || "Workspace / Analytics"}</span>
        </div>

        {/* Title & Connection Status */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {activeTab !== "dashboard" && (
            <button
              onClick={() => onTabChange("dashboard")}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Overview"
            >
              <ArrowLeft size={17} />
            </button>
          )}

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {titles[activeTab] || "ERP Analytics Dashboard"}
          </h1>

          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              backendOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            {backendOnline ? "Snowflake Live" : "API Offline"}
          </span>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-auto flex-wrap">
        {/* Timestamp */}
        {lastUpdated && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Clock size={12} className="text-slate-400" />
            <span>{lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
        )}

        {/* Theme Toggle (Mobile & Desktop) */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={14} className="text-amber-400" />
          ) : (
            <Moon size={14} className="text-indigo-600" />
          )}
          <span className="hidden sm:inline text-[11px] font-medium">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </button>

        {/* Ask Copilot Quick Button */}
        {activeTab !== "copilot" && (
          <button
            onClick={onOpenCopilot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>Ask Copilot</span>
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            size={13}
            className={refreshing ? "animate-spin text-slate-900 dark:text-white" : "text-slate-500"}
          />
          <span>{refreshing ? "Fetching..." : "Refresh"}</span>
        </button>
      </div>
    </header>
  );
}
