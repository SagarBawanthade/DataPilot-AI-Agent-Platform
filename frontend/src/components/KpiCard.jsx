import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({
  title,
  value,
  subtitle,
  changePercent,
  icon: Icon,
  accent = "indigo",
  loading = false,
}) {
  const accentStyles = {
    indigo: {
      border: "border-slate-200 hover:border-indigo-300",
      iconBg: "bg-indigo-50 text-indigo-600",
    },
    emerald: {
      border: "border-slate-200 hover:border-emerald-300",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    amber: {
      border: "border-slate-200 hover:border-amber-300",
      iconBg: "bg-amber-50 text-amber-600",
    },
    rose: {
      border: "border-slate-200 hover:border-rose-300",
      iconBg: "bg-rose-50 text-rose-600",
    },
    slate: {
      border: "border-slate-200 hover:border-slate-400",
      iconBg: "bg-slate-100 text-slate-700",
    },
  };

  const style = accentStyles[accent] || accentStyles.indigo;

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
        <div className="h-7 bg-slate-200 rounded w-28 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
    );
  }

  const hasChange = typeof changePercent === "number" && !isNaN(changePercent);
  const isPositive = hasChange && changePercent >= 0;

  return (
    <div
      className={`bg-white p-5 rounded-xl border ${style.border} shadow-2xs transition-colors`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${style.iconBg}`}>
            <Icon size={16} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </div>
        {hasChange && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-2 truncate font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}