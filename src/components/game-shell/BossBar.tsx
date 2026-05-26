import type { BossBarProps } from "./types";

export function BossBar({ enemies, maxEnemies }: BossBarProps) {
  const progress = Math.max(0, (enemies / maxEnemies) * 100);

  return (
    <div className="w-[520px] border-2 border-purple-400/40 bg-black/75 p-2">
      <div className="mb-1 flex items-center justify-between text-sm font-bold uppercase">
        <span className="text-purple-300">Data Colossus</span>
        <span className="text-cyan-200">{enemies} enemies</span>
      </div>

      <div className="h-4 overflow-hidden bg-[#18080d]">
        <div className="h-full bg-red-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
