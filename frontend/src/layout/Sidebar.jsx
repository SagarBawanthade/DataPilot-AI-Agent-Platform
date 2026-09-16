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
} from "lucide-react";

export default function Sidebar({
  activeTab = "dashboard",
  onTabChange = () => {},
  invoicesCount = 0,
  reorderCount = 0,
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
      count: reorderCount > 0 ? reorderCount : null,
      countColor: "bg-rose-500/20 text-rose-300",
    },
    {
      id: "invoices",
      name: "Overdue Invoices",
      icon: CreditCard,
      count: invoicesCount > 0 ? invoicesCount : null,
      countColor: "bg-amber-500/20 text-amber-300",
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-3 py-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Layers size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight">
              DataPilot AI
            </div>
            <p className="text-[11px] text-slate-400">
              ERP Analytics
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : item.countColor || "bg-slate-800 text-slate-300"
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

      {/* System Status */}
      <div className="pt-4 border-t border-slate-800">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Database size={13} className="text-indigo-400" />
              <span>Snowflake DW</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Direct Warehouse Marts
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-900 text-white border border-slate-700 shadow-md cursor-pointer"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-slate-950 border-r border-slate-850 p-4 flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col h-full z-50 overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}