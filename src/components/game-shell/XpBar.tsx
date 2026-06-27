import type { XpBarProps } from "./types";

export function XpBar({
  level,
  xp,
  xpGoal,
  density = "default",
}: XpBarProps) {
  const xpPercent = Math.min(100, (xp / xpGoal) * 100);
  const isCompact = density === "compact";

  return (
    <div
      className={`flex items-center ${
        isCompact ? "w-56 gap-1" : "w-[520px] gap-3"
      }`}
    >
      <div className={isCompact ? "text-[10px] font-bold" : "text-lg font-bold"}>
        Lv. {level}
      </div>
      <div
        className={`flex-1 overflow-hidden border border-cyan-300/40 bg-black/70 ${
          isCompact ? "h-2" : "h-4"
        }`}
      >
        <div
          className="h-full bg-cyan-300"
          style={{ width: `${xpPercent}%` }}
        />
      </div>
      <div
        className={`font-bold text-cyan-200 ${
          isCompact ? "text-[10px]" : ""
        }`}
      >
        {xp.toLocaleString()} / {xpGoal.toLocaleString()}
      </div>
    </div>
  );
}
