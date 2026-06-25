import type { PlayerCardProps } from "./types";

export function PlayerCard({
  health,
  level,
  maxHealth,
  playerName = "Codebound Hero",
  showExperience = false,
  xp = 0,
  xpGoal = 1,
}: PlayerCardProps) {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const xpPercent = Math.max(0, Math.min(100, (xp / xpGoal) * 100));

  return (
    <div className="flex h-28 w-64 items-stretch gap-3 border-2 border-cyan-300/30 bg-black/70 p-2">
      <div className="flex h-full w-20 flex-col items-center justify-center border-2 border-cyan-300/40 bg-[#102432] text-cyan-100">
        <div className="text-2xl font-bold">CB</div>
        <div className="mt-1 text-[10px] font-bold uppercase text-cyan-300">
          Hero
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-end">
        <div className="mb-2 truncate text-sm font-bold text-cyan-100">
          {playerName}
        </div>

        <div className="relative h-5 overflow-hidden border border-green-200/30 bg-[#061217]">
          <div
            className="absolute inset-y-0 left-0 bg-green-400"
            style={{ width: `${healthPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
            {health} / {maxHealth} HP
          </div>
        </div>

        {showExperience ? (
          <div className="mt-2 flex items-center gap-2">
            <div className="border border-cyan-300/40 bg-black px-2 text-sm font-bold">
              {level}
            </div>
            <div className="relative h-3 flex-1 overflow-hidden bg-[#061217]">
              <div
                className="h-full bg-cyan-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
