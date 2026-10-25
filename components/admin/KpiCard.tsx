import React from "react";

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "teal" | "amber" | "emerald" | "rose" | "purple" | "cyan";
  isDemo?: boolean;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "default",
  isDemo = false,
}: KpiCardProps) {
  const toneStyles = {
    default: {
      card: "border-slate-200 bg-white hover:border-slate-300",
      iconBox: "bg-slate-100 text-slate-700",
      accent: "text-slate-900",
    },
    teal: {
      card: "border-teal-200 bg-white hover:border-teal-300",
      iconBox: "bg-teal-50 text-teal-700 border border-teal-200",
      accent: "text-teal-900",
    },
    amber: {
      card: "border-amber-200 bg-white hover:border-amber-300",
      iconBox: "bg-amber-50 text-amber-700 border border-amber-200",
      accent: "text-amber-900",
    },
    cyan: {
      card: "border-cyan-200 bg-white hover:border-cyan-300",
      iconBox: "bg-cyan-50 text-cyan-700 border border-cyan-200",
      accent: "text-cyan-900",
    },
    purple: {
      card: "border-purple-200 bg-white hover:border-purple-300",
      iconBox: "bg-purple-50 text-purple-700 border border-purple-200",
      accent: "text-purple-900",
    },
    emerald: {
      card: "border-emerald-200 bg-white hover:border-emerald-300",
      iconBox: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      accent: "text-emerald-900",
    },
    rose: {
      card: "border-rose-200 bg-white hover:border-rose-300",
      iconBox: "bg-rose-50 text-rose-700 border border-rose-200",
      accent: "text-rose-900",
    },
  }[tone];

  return (
    <div
      className={`relative p-5 rounded-xl border shadow-xs transition-all hover:shadow-md ${toneStyles.card}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${toneStyles.accent}`}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            {isDemo && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Demo
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className={`p-3 rounded-lg shrink-0 ${toneStyles.iconBox}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded w-16" />
          <div className="h-3 bg-slate-100 rounded w-36" />
        </div>
        <div className="w-12 h-12 rounded-lg bg-slate-200 shrink-0" />
      </div>
    </div>
  );
}
