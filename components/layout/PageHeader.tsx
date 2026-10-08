import React from "react";

interface PageHeaderProps {
  greeting?: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  greeting,
  title,
  description,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4 pb-2 border-b border-slate-100">
      <div>
        {greeting && (
          <p className="text-[11px] sm:text-sm font-medium text-blue-600 mb-0.5 sm:mb-1 flex items-center gap-1.5">
            <span>{greeting}</span>
          </p>
        )}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          {badge && (
            <div className="hidden sm:inline-flex shrink-0">
              {badge}
            </div>
          )}
        </div>
        {description && (
          <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-wrap w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
