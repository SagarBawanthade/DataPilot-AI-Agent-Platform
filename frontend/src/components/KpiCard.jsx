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
      border: "border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/60 dark:hover:border-indigo-600/60",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50",
    },
    emerald: {
      border: "border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/60 dark:hover:border-emerald-600/60",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/50",
    },
    amber: {
      border: "border-slate-200/90 dark:border-slate-800 hover:border-amber-400/60 dark:hover:border-amber-600/60",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100/80 dark:border-amber-900/50",
    },
    rose: {
      border: "border-slate-200/90 dark:border-slate-800 hover:border-rose-400/60 dark:hover:border-rose-600/60",
      iconBg: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100/80 dark:border-rose-900/50",
    },
    slate: {
      border: "border-slate-200/90 dark:border-slate-800 hover:border-slate-400/60 dark:hover:border-slate-600/60",
      iconBg: "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80",
    },
  };

  const style = accentStyles[accent] || accentStyles.indigo;

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs animate-pulse">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20 mb-3" />
        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-28 mb-2" />
        <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-16" />
      </div>
    );
  }

  const hasChange = typeof changePercent === "number" && !isNaN(changePercent);
  const isPositive = hasChange && changePercent >= 0;

  return (
    <div
      className={`bg-white dark:bg-[#0f172a] p-5 rounded-xl border ${style.border} shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 tracking-wider uppercase">
            {title}
          </span>
          {Icon && (
            <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
              <Icon size={15} strokeWidth={2.2} />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
            {value}
          </div>
          {hasChange && (
            <div
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono border ${
                isPositive
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60"
                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/60"
              }`}
            >
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{Math.abs(changePercent).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 truncate font-medium border-t border-slate-100 dark:border-slate-800/80 pt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}