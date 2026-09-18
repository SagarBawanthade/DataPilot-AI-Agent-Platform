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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-7 border-b border-slate-200/40 dark:border-white/[0.06] transition-colors">
      <div>
        {/* Breadcrumb path */}
        <div className="text-[10.5px] font-mono text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5 font-medium tracking-wide">
          <span>{breadcrumbs[activeTab] || "Workspace / Analytics"}</span>
        </div>

        {/* Title & Connection Status */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {activeTab !== "dashboard" && (
            <button
              onClick={() => onTabChange("dashboard")}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white hover:bg-slate-500/5 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
              title="Back to Overview"
            >
              <ArrowLeft size={17} />
            </button>
          )}

          <h1 className="text-xl sm:text-2xl font-bold tracking-[-0.03em] text-slate-900 dark:text-slate-50">
            {titles[activeTab] || "ERP Analytics Dashboard"}
          </h1>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium backdrop-blur-sm ${
              backendOnline
                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-300/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : "bg-rose-500/10 text-rose-700 border border-rose-300/30 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
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
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-white/40 dark:border-white/10">
            <Clock size={12} className="text-slate-400/70" />
            <span>{lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
        )}

        {/* Theme Toggle (Mobile & Desktop) */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm shadow-black/5"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun size={14} className="text-amber-400" />
          ) : (
            <Moon size={14} className="text-violet-600" />
          )}
          <span className="hidden sm:inline text-[11px] font-medium">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </button>

        {/* Ask Copilot Quick Button */}
        {activeTab !== "copilot" && (
          <button
            onClick={onOpenCopilot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-50/80 to-indigo-50/80 dark:from-violet-500/10 dark:to-indigo-500/10 hover:from-violet-100/80 hover:to-indigo-100/80 dark:hover:from-violet-500/15 dark:hover:to-indigo-500/15 text-violet-700 dark:text-violet-300 border border-violet-200/40 dark:border-violet-500/20 text-xs font-semibold shadow-sm shadow-violet-500/5 transition-all duration-200 cursor-pointer backdrop-blur-sm"
          >
            <Sparkles size={13} className="text-violet-600 dark:text-violet-400" />
            <span>Ask Copilot</span>
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 shadow-sm shadow-black/5 transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            size={13}
            className={refreshing ? "animate-spin text-slate-900 dark:text-white" : "text-slate-400"}
          />
          <span>{refreshing ? "Fetching..." : "Refresh"}</span>
        </button>
      </div>
    </header>
  );
}
