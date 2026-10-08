export const SCHOOL_NAME = "Trường THCS Na Sầm";

export function getScoreType(points: number): "positive" | "negative" | "zero" {
  if (points > 0) return "positive";
  if (points < 0) return "negative";
  return "zero";
}
