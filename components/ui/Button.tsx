import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-blue-500/20 focus:ring-blue-500 active:scale-[0.98]",
    secondary:
      "bg-blue-50 hover:bg-blue-100 text-blue-700 focus:ring-blue-400 active:scale-[0.98]",
    outline:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 focus:ring-blue-400 active:scale-[0.98]",
    ghost:
      "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 focus:ring-slate-300",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-rose-500/20 focus:ring-rose-500 active:scale-[0.98]",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-500/20 focus:ring-emerald-500 active:scale-[0.98]",
  };

  const sizes = {
    sm: "text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl",
    md: "text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2.5 gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl",
    lg: "text-xs sm:text-base px-3.5 sm:px-5 py-2 sm:py-3 gap-2 sm:gap-2.5 rounded-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && (
        <span className="shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
