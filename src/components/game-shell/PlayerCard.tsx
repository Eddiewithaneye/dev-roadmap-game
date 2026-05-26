import type { PlayerCardProps } from "./types";

export function PlayerCard({ health, level, maxHealth }: PlayerCardProps) {
  const healthPercent = (health / maxHealth) * 100;

  return (
    <div className="flex w-52 items-end gap-2 border-2 border-cyan-300/30 bg-black/70 p-2">
      <div className="flex h-16 w-16 items-center justify-center border-2 border-cyan-300/40 bg-[#102432] text-3xl">
        ◉
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between bg-green-700 px-2 text-sm font-bold">
          <span>{health}</span>
          <span>/ {maxHealth}</span>
        </div>

        <div className="mb-1 h-3 overflow-hidden bg-[#061217]">
          <div
            className="h-full bg-green-400"
            style={{ width: `${healthPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="border border-cyan-300/40 bg-black px-2 text-sm font-bold">
            {level}
          </div>
          <div className="h-3 flex-1 overflow-hidden bg-[#061217]">
            <div className="h-full w-2/3 bg-cyan-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
