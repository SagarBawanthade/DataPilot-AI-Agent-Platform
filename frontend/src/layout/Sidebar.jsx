import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  Database,
  Menu,
  X,
  Layers,
  Sparkles,
  Sun,
  Moon,
  ChevronRight,
  Activity,
} from "lucide-react";

export default function Sidebar({
  activeTab = "dashboard",
  onTabChange = () => {},
  invoicesCount = 0,
  reorderCount = 0,
  theme = "dark",
  onToggleTheme = () => {},
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    {
      id: "dashboard",
      name: "Overview",
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: "revenue",
      name: "Monthly Revenue",
      icon: TrendingUp,
      count: null,
    },
    {
      id: "customers",
      name: "Top Customers",
      icon: Users,
      count: null,
    },
    {
      id: "inventory",
      name: "Inventory Health",
      icon: Package,
      count: reorderCount > 0 ? `${reorderCount} low` : null,
      countColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15",
    },
    {
      id: "invoices",
      name: "Overdue Invoices",
      icon: CreditCard,
      count: invoicesCount > 0 ? invoicesCount : null,
      countColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15",
    },
    {
      id: "copilot",
      name: "AI Copilot",
      icon: Sparkles,
      count: "Live",
      countColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15 font-semibold",
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3 py-4 mb-6 border-b border-white/20 dark:border-white/[0.06] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Layers size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                  DataPilot
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-violet-100/60 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-medium border border-violet-200/40 dark:border-violet-500/20">
                  AI
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Enterprise Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Group */}
        <nav className="space-y-1 px-1">
          <div className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400/70 dark:text-slate-500/70">
            Analytics Marts
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 dark:from-violet-500/15 dark:to-indigo-500/15 border border-violet-200/40 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 shadow-sm shadow-violet-500/5 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-500/5 dark:hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    className={`transition-all duration-200 group-hover:scale-105 ${
                      isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-300/30 dark:border-violet-500/20"
                        : item.countColor || "bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-white/10"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls & System Status */}
      <div className="space-y-3 pt-4 border-t border-white/20 dark:border-white/[0.06]">
        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-500/5 dark:hover:bg-white/5 border border-white/30 dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.03] backdrop-blur-sm transition-all duration-200 cursor-pointer"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Sun size={14} className="text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon size={14} className="text-violet-600 transition-transform hover:-rotate-12" />
            )}
            <span>{theme === "dark" ? "Light Theme" : "Dark Theme"}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400/70 uppercase">
            {theme}
          </span>
        </button>

        {/* Snowflake Warehouse Status Card */}
        <div className="p-3 rounded-xl bg-white/30 dark:bg-white/[0.03] backdrop-blur-sm border border-white/30 dark:border-white/[0.06] text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium text-[11.5px]">
              <Database size={13} className="text-violet-600 dark:text-violet-400" />
              <span>Snowflake DW</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono flex items-center justify-between">
            <span>COMPUTE_WH</span>
            <span className="text-slate-400/70">dbt marts</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-3.5 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl text-slate-700 dark:text-slate-200 border border-white/40 dark:border-white/10 shadow-lg shadow-black/5 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border-r border-white/30 dark:border-white/[0.06] p-4 flex-col shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-300">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-white/30 dark:border-white/[0.06] p-5 flex flex-col h-full z-50 overflow-y-auto shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}