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
      countColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    },
    {
      id: "invoices",
      name: "Overdue Invoices",
      icon: CreditCard,
      count: invoicesCount > 0 ? invoicesCount : null,
      countColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
    {
      id: "copilot",
      name: "AI Copilot",
      icon: Sparkles,
      count: "Live",
      countColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold",
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3 py-3 mb-6 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Layers size={17} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                  DataPilot
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-100 dark:border-indigo-900/50">
                  AI
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                Enterprise Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Group */}
        <nav className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.4 : 2}
                    className={`transition-transform duration-150 group-hover:scale-105 ${
                      isActive
                        ? "text-white dark:text-slate-900"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900 font-medium"
                        : item.countColor || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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
      <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Theme Switcher Button */}
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Sun size={14} className="text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon size={14} className="text-indigo-600 transition-transform hover:-rotate-12" />
            )}
            <span>{theme === "dark" ? "Light Theme" : "Dark Theme"}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            {theme}
          </span>
        </button>

        {/* Snowflake Warehouse Status Card */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium text-[11.5px]">
              <Database size={13} className="text-indigo-600 dark:text-indigo-400" />
              <span>Snowflake DW</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>COMPUTE_WH</span>
            <span className="text-slate-400">dbt marts</span>
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
          className="p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white dark:bg-[#0b101b] border-r border-slate-200/90 dark:border-slate-800/80 p-4 flex-col shrink-0 h-screen sticky top-0 overflow-y-auto transition-colors duration-200">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-white dark:bg-[#0b101b] border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col h-full z-50 overflow-y-auto shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}