import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getTopCustomers,
  getMonthlyRevenue,
  getInventoryHealth,
  getOverdueInvoices,
} from "../services/api";

import Sidebar from "../layout/Sidebar";
import Header from "../components/Header";
import RevenueChart from "../components/RevenueChart";
import KpiCard from "../components/KpiCard";
import TopCustomersTable from "../components/TopCustomersTable";
import InventoryTable from "../components/InventoryTable";
import OverdueInvoicesTable from "../components/OverdueInvoicesTable";
import MonthlyBreakdownTable from "../components/MonthlyBreakdownTable";
import CopilotChat from "../components/CopilotChat";

import {
  TrendingUp,
  Users,
  Package,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Sparkles,
  Database,
} from "lucide-react";
import { formatCurrency, getDaysOverdue } from "../utils/formatters";

export default function DashboardPage() {
  const [customers, setCustomers] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [copilotDrawerOpen, setCopilotDrawerOpen] = useState(false);

  // Dark/Light Theme management
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("datapilot_theme");
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("datapilot_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Pure dynamic data fetcher - directly hitting backend APIs
  const loadDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [custRes, revRes, invRes, invcRes] = await Promise.all([
        getTopCustomers(),
        getMonthlyRevenue(),
        getInventoryHealth(),
        getOverdueInvoices(),
      ]);

      setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
      setRevenue(Array.isArray(revRes.data) ? revRes.data : []);
      setInventory(Array.isArray(invRes.data) ? invRes.data : []);
      setInvoices(Array.isArray(invcRes.data) ? invcRes.data : []);

      setBackendOnline(true);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Backend API fetch failure:", err);
      setBackendOnline(false);
      setError("Unable to reach backend API. Ensure the analytics service is running on port 8000.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      await loadDashboardData(false);
      if (!active) return;
    }

    init();

    return () => {
      active = false;
    };
  }, [loadDashboardData]);

  // Derived real dynamic calculations
  const totalCustomerRevenue = useMemo(() => {
    return customers.reduce((sum, c) => sum + Number(c.TOTAL_REVENUE || 0), 0);
  }, [customers]);

  const totalAllRevenue = useMemo(() => {
    return revenue.reduce((sum, r) => sum + Number(r.REVENUE ?? r.TOTAL_REVENUE ?? 0), 0);
  }, [revenue]);

  const totalOrdersCount = useMemo(() => {
    return revenue.reduce((sum, r) => sum + Number(r.TOTAL_ORDERS ?? r.ORDERS ?? 0), 0);
  }, [revenue]);

  // Real MoM percentage from the two most recent months
  const momGrowth = useMemo(() => {
    if (!revenue || revenue.length < 2) return null;
    const latest = Number(revenue[0].REVENUE ?? revenue[0].TOTAL_REVENUE ?? 0);
    const prior = Number(revenue[1].REVENUE ?? revenue[1].TOTAL_REVENUE ?? 0);
    if (prior <= 0) return null;
    return ((latest - prior) / prior) * 100;
  }, [revenue]);

  const criticalReorderCount = useMemo(() => {
    return inventory.filter(
      (item) =>
        (item.STOCK_STATUS || "").toUpperCase() === "REORDER" ||
        Number(item.CURRENT_STOCK ?? 0) <= Number(item.REORDER_LEVEL ?? 0)
    ).length;
  }, [inventory]);

  const totalOverdueAmount = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + Number(inv.AMOUNT || 0), 0);
  }, [invoices]);

  const maxOverdueDays = useMemo(() => {
    if (!invoices.length) return 0;
    return Math.max(...invoices.map((inv) => getDaysOverdue(inv.DUE_DATE)), 0);
  }, [invoices]);

  const topCustomerName = useMemo(() => {
    return customers.length > 0 ? customers[0].CUSTOMER_NAME : null;
  }, [customers]);

  return (
    <div className="flex bg-[#f8fafc] dark:bg-[#070b14] min-h-screen text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Functional Minimalist Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        invoicesCount={invoices.length}
        reorderCount={criticalReorderCount}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1500px] mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={() => loadDashboardData(true)}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          backendOnline={backendOnline}
          onOpenCopilot={() => setCopilotDrawerOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Error notification if backend drops */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadDashboardData(true)}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ================= VIEW 1: OVERVIEW DASHBOARD ================= */}
        {activeTab === "dashboard" && (
          <>
            {/* 4 Executive KPI Metric Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                title="Top Accounts Revenue"
                value={formatCurrency(totalCustomerRevenue)}
                subtitle={
                  revenue.length > 0
                    ? `Latest month: ${formatCurrency(revenue[0].REVENUE, true)}`
                    : "Aggregated from accounts"
                }
                changePercent={momGrowth}
                icon={TrendingUp}
                accent="indigo"
                loading={loading}
              />

              <KpiCard
                title="Enterprise Customers"
                value={customers.length}
                subtitle={
                  topCustomerName
                    ? `Top: ${topCustomerName}`
                    : "Active accounts"
                }
                icon={Users}
                accent="slate"
                loading={loading}
              />

              <KpiCard
                title="Monitored SKUs"
                value={inventory.length}
                subtitle={
                  criticalReorderCount > 0
                    ? `${criticalReorderCount} require reorder`
                    : "All stock healthy"
                }
                icon={Package}
                accent={criticalReorderCount > 0 ? "rose" : "emerald"}
                loading={loading}
              />

              <KpiCard
                title="Overdue Invoices"
                value={invoices.length}
                subtitle={
                  totalOverdueAmount > 0
                    ? `${formatCurrency(totalOverdueAmount)} outstanding`
                    : "No overdue receivables"
                }
                icon={CreditCard}
                accent="amber"
                loading={loading}
              />
            </section>

            {/* Monthly Revenue Analytical Chart */}
            <section className="mb-6">
              <RevenueChart data={revenue} loading={loading} />
            </section>

            {/* Data Tables Grid: Top Customers & Inventory Health */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="h-full">
                <TopCustomersTable customers={customers} loading={loading} />
              </div>

              <div className="h-full">
                <InventoryTable inventory={inventory} loading={loading} />
              </div>
            </section>

            {/* Overdue Invoices Table */}
            <section className="mb-6">
              <OverdueInvoicesTable invoices={invoices} loading={loading} />
            </section>
          </>
        )}

        {/* ================= VIEW 2: MONTHLY REVENUE ================= */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Cumulative Revenue"
                value={formatCurrency(totalAllRevenue)}
                subtitle={`Across ${revenue.length} recorded periods`}
                icon={TrendingUp}
                accent="indigo"
                loading={loading}
              />
              <KpiCard
                title="Latest Period Revenue"
                value={revenue.length > 0 ? formatCurrency(revenue[0].REVENUE) : "₹0"}
                subtitle={revenue.length > 0 ? revenue[0].REVENUE_MONTH : "Recent month"}
                changePercent={momGrowth}
                icon={TrendingUp}
                accent="emerald"
                loading={loading}
              />
              <KpiCard
                title="Total Order Volume"
                value={totalOrdersCount.toLocaleString()}
                subtitle={`Avg ${(totalOrdersCount / Math.max(revenue.length, 1)).toFixed(0)} orders/month`}
                icon={ShoppingCart}
                accent="slate"
                loading={loading}
              />
              <KpiCard
                title="Average Monthly Run"
                value={formatCurrency(totalAllRevenue / Math.max(revenue.length, 1), true)}
                subtitle="Calculated mean over period"
                icon={TrendingUp}
                accent="indigo"
                loading={loading}
              />
            </section>

            <RevenueChart data={revenue} loading={loading} />
            <MonthlyBreakdownTable data={revenue} loading={loading} />
          </div>
        )}

        {/* ================= VIEW 3: TOP CUSTOMERS ================= */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                title="Top Account Revenue"
                value={formatCurrency(totalCustomerRevenue)}
                subtitle="Sum of top 10 accounts"
                icon={TrendingUp}
                accent="indigo"
                loading={loading}
              />
              <KpiCard
                title="Tracked Accounts"
                value={customers.length}
                subtitle="High volume enterprises"
                icon={Users}
                accent="slate"
                loading={loading}
              />
              <KpiCard
                title="Average Account Value"
                value={formatCurrency(totalCustomerRevenue / Math.max(customers.length, 1))}
                subtitle={`Top: ${topCustomerName || "N/A"}`}
                icon={Users}
                accent="emerald"
                loading={loading}
              />
            </section>

            <div>
              <TopCustomersTable customers={customers} loading={loading} />
            </div>
          </div>
        )}

        {/* ================= VIEW 4: INVENTORY HEALTH ================= */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                title="Monitored SKUs"
                value={inventory.length}
                subtitle="Total products tracked"
                icon={Package}
                accent="slate"
                loading={loading}
              />
              <KpiCard
                title="Critical Reorders"
                value={criticalReorderCount}
                subtitle={criticalReorderCount > 0 ? "Immediate purchase orders needed" : "Zero deficits"}
                icon={AlertTriangle}
                accent={criticalReorderCount > 0 ? "rose" : "emerald"}
                loading={loading}
              />
              <KpiCard
                title="Healthy Stock SKUs"
                value={inventory.length - criticalReorderCount}
                subtitle={`${(((inventory.length - criticalReorderCount) / Math.max(inventory.length, 1)) * 100).toFixed(0)}% safety compliance`}
                icon={CheckCircle2}
                accent="emerald"
                loading={loading}
              />
            </section>

            <div>
              <InventoryTable inventory={inventory} loading={loading} />
            </div>
          </div>
        )}

        {/* ================= VIEW 5: OVERDUE INVOICES ================= */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                title="Outstanding Debt"
                value={formatCurrency(totalOverdueAmount)}
                subtitle="Total overdue receivables"
                icon={CreditCard}
                accent="rose"
                loading={loading}
              />
              <KpiCard
                title="Delinquent Invoices"
                value={invoices.length}
                subtitle="Exceeded payment terms"
                icon={AlertCircle}
                accent="amber"
                loading={loading}
              />
              <KpiCard
                title="Maximum Aging"
                value={maxOverdueDays > 0 ? `${maxOverdueDays} days` : "Current"}
                subtitle="Oldest unpaid balance"
                icon={Clock}
                accent="slate"
                loading={loading}
              />
            </section>

            <div>
              <OverdueInvoicesTable invoices={invoices} loading={loading} />
            </div>
          </div>
        )}

        {/* ================= VIEW 6: AI COPILOT ================= */}
        {activeTab === "copilot" && (
          <div className="space-y-6">
            {/* 3 Domain Status Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                title="AI Data Source"
                value="Snowflake DW"
                subtitle="Live direct warehouse connection"
                icon={Database}
                accent="indigo"
              />
              <KpiCard
                title="Supported Marts"
                value="4 Analytics Marts"
                subtitle="Customers, Revenue, Stock, Invoices"
                icon={Sparkles}
                accent="emerald"
              />
              <KpiCard
                title="Copilot Intelligence"
                value="DataPilot Engine"
                subtitle="Real-time SQL and analytical synthesis"
                icon={CheckCircle2}
                accent="slate"
              />
            </section>

            {/* Google Gemini Full-Screen Experience */}
            <CopilotChat
              variant="full"
              onNavigateTab={setActiveTab}
            />
          </div>
        )}
      </main>

      {/* ================= FLOATING COPILOT ACTION BUTTON (FAB) ================= */}
      {activeTab !== "copilot" && (
        <button
          onClick={() => setCopilotDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-xl shadow-slate-900/20 dark:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-700/60 dark:border-indigo-400/30"
          title="Open ERP AI Copilot"
        >
          <div className="relative flex items-center">
            <Sparkles size={16} className="text-indigo-400 dark:text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="font-semibold tracking-tight">Ask Copilot</span>
        </button>
      )}

      {/* ================= SLIDE-OVER COPILOT DRAWER ================= */}
      {copilotDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setCopilotDrawerOpen(false)}
          />

          {/* Slide-out Panel */}
          <div className="relative w-full max-w-lg md:max-w-xl bg-white dark:bg-[#0b101b] border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col z-50 p-0 overflow-hidden">
            <CopilotChat
              variant="drawer"
              onClose={() => setCopilotDrawerOpen(false)}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                setCopilotDrawerOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}