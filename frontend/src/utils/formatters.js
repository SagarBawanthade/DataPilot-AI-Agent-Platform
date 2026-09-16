/**
 * Formatting utilities for DataPilot AI SaaS dashboard
 */

export function formatCurrency(amount, compact = false) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "₹0";
  }
  const val = Number(amount);

  if (compact) {
    if (Math.abs(val) >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(val) >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    if (Math.abs(val) >= 1000) {
      return `₹${(val / 1000).toFixed(1)}k`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(Number(num))) return "0";
  return new Intl.NumberFormat("en-IN").format(Number(num));
}

export function formatMonthLabel(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function getDaysOverdue(dueDateStr) {
  if (!dueDateStr) return 0;
  try {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
}
