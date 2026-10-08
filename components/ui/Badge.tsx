import { getScoreType } from "@/lib/constants";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "neutral" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const base = "inline-flex items-center font-medium rounded-full whitespace-nowrap";

  const variants = {
    primary: "bg-blue-50 text-blue-700 border border-blue-200/60",
    secondary: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    danger: "bg-rose-50 text-rose-700 border border-rose-200/60",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/60",
    neutral: "bg-slate-100 text-slate-600",
    outline: "border border-slate-200 text-slate-600 bg-white",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

// Huy hiệu điểm số chuyên dụng (+10, -5, 0)
export function ScoreBadge({
  points,
  showPlus = true,
  className = "",
}: {
  points: number;
  showPlus?: boolean;
  className?: string;
}) {
  const type = getScoreType(points);

  if (type === "positive") {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs min-w-[28px] sm:min-w-[34px] text-center ${className}`}
      >
        {showPlus ? `+${points}` : points}
      </span>
    );
  }

  if (type === "negative") {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs min-w-[26px] sm:min-w-[30px] text-center ${className}`}
      >
        {points}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold text-slate-400 bg-slate-100/70 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs min-w-[20px] sm:min-w-[24px] text-center ${className}`}
    >
      0
    </span>
  );
}

// Huy hiệu xếp hạng (🥇 1, 🥈 2, 🥉 3, #4,...)
export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center gap-1 font-black text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs shadow-2xs whitespace-nowrap">
        <span className="text-xl sm:text-sm leading-none">🥇</span>
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center gap-1 font-black text-slate-700 bg-slate-200/90 border border-slate-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs shadow-2xs whitespace-nowrap">
        <span className="text-xl sm:text-sm leading-none">🥈</span>
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center gap-1 font-black text-amber-900 bg-amber-100/70 border border-amber-600/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs shadow-2xs whitespace-nowrap">
        <span className="text-xl sm:text-sm leading-none">🥉</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center font-bold text-slate-500 bg-slate-100/90 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs min-w-[22px] sm:min-w-[26px] whitespace-nowrap">
      #{rank}
    </span>
  );
}
