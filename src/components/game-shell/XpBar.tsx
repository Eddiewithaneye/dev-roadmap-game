import type { XpBarProps } from "./types";

export function XpBar({ level, xp, xpGoal }: XpBarProps) {
  const xpPercent = Math.min(100, (xp / xpGoal) * 100);

  return (
    <div className="flex w-[520px] items-center gap-3">
      <div className="text-lg font-bold">Lv. {level}</div>
      <div className="h-4 flex-1 overflow-hidden border border-cyan-300/40 bg-black/70">
        <div
          className="h-full bg-cyan-300"
          style={{ width: `${xpPercent}%` }}
        />
      </div>
      <div className="font-bold text-cyan-200">
        {xp.toLocaleString()} / {xpGoal.toLocaleString()}
      </div>
    </div>
  );
}
