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
      border: "border-white/40 dark:border-white/[0.06] hover:border-indigo-300/40 dark:hover:border-indigo-500/20",
      iconBg: "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-500/15",
    },
    emerald: {
      border: "border-white/40 dark:border-white/[0.06] hover:border-emerald-300/40 dark:hover:border-emerald-500/20",
      iconBg: "bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 dark:border-emerald-500/15",
    },
    amber: {
      border: "border-white/40 dark:border-white/[0.06] hover:border-amber-300/40 dark:hover:border-amber-500/20",
      iconBg: "bg-amber-50/60 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/30 dark:border-amber-500/15",
    },
    rose: {
      border: "border-white/40 dark:border-white/[0.06] hover:border-rose-300/40 dark:hover:border-rose-500/20",
      iconBg: "bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200/30 dark:border-rose-500/15",
    },
    slate: {
      border: "border-white/40 dark:border-white/[0.06] hover:border-slate-300/40 dark:hover:border-slate-500/20",
      iconBg: "bg-slate-100/50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/30 dark:border-white/10",
    },
  };

  const style = accentStyles[accent] || accentStyles.indigo;

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/40 dark:border-white/[0.06] shadow-lg shadow-black/[0.03] animate-pulse">
        <div className="h-3 bg-slate-200/60 dark:bg-white/5 rounded w-20 mb-3" />
        <div className="h-7 bg-slate-200/60 dark:bg-white/5 rounded w-28 mb-2" />
        <div className="h-3 bg-slate-100/60 dark:bg-white/[0.03] rounded w-16" />
      </div>
    );
  }

  const hasChange = typeof changePercent === "number" && !isNaN(changePercent);
  const isPositive = hasChange && changePercent >= 0;

  return (
    <div
      className={`bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border ${style.border} shadow-lg shadow-black/[0.03] hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 tracking-[0.08em] uppercase">
            {title}
          </span>
          {Icon && (
            <div className={`p-1.5 rounded-xl ${style.iconBg}`}>
              <Icon size={15} strokeWidth={2.2} />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-[1.65rem] font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
            {value}
          </div>
          {hasChange && (
            <div
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[11px] font-semibold font-mono ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300/20 dark:border-emerald-500/15"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300/20 dark:border-rose-500/15"
              }`}
            >
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{Math.abs(changePercent).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 truncate font-medium pt-2.5 opacity-80">
          {subtitle}
        </p>
      )}
    </div>
  );
}