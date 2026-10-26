import React from "react";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "default" | "full" | "narrow";
}

export function PageContainer({
  children,
  className = "",
  maxWidth = "default",
}: PageContainerProps) {
  const maxClass = {
    default: "max-w-7xl",
    full: "max-w-full",
    narrow: "max-w-4xl",
  }[maxWidth];

  return (
    <div className={`w-full mx-auto space-y-6 ${maxClass} ${className}`}>
      {children}
    </div>
  );
}

export interface CardSectionProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function CardSection({
  title,
  subtitle,
  headerAction,
  children,
  className = "",
  noPadding = false,
}: CardSectionProps) {
  return (
    <section className={`bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div>
            {title && <h2 className="text-sm font-bold text-slate-900">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}
