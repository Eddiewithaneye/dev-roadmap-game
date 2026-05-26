"use client";

import type { Enemy } from "@/lib/game/combat";

type EnemyPanelProps = {
  enemy: Enemy;
  enemies: number;
  maxEnemies: number;
};

export default function EnemyPanel({ enemy, enemies, maxEnemies }: EnemyPanelProps) {
  const progress = Math.max(0, (enemies / maxEnemies) * 100);
  const healthPercent = Math.max(0, (enemy.health / enemy.maxHealth) * 100);

  return (
    <div className="w-[520px] border-2 border-purple-400/40 bg-black/75 p-2">
      <div className="mb-1 flex items-center justify-between text-sm font-bold uppercase">
        <span className="text-purple-300">{enemy.name}</span>
        <span className="text-cyan-200">{enemies} enemies</span>
      </div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-cyan-300">
        <span>Integrity</span>
        <span>{enemy.health} / {enemy.maxHealth}</span>
      </div>
      <div className="mb-2 h-3 overflow-hidden bg-[#18080d]">
        <div className="h-full bg-red-500" style={{ width: `${healthPercent}%` }} />
      </div>
      <div className="h-4 overflow-hidden bg-[#18080d]">
        <div className="h-full bg-fuchsia-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
