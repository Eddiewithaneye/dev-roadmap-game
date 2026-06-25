import type { EnemyPanelProps } from "./types";

export function EnemyPanel({ primaryTarget }: EnemyPanelProps) {
  const healthPercent = Math.max(
    0,
    (primaryTarget.health / primaryTarget.maxHealth) * 100,
  );

  return (
    <div className="w-[520px] border-2 border-purple-400/40 bg-black/75 p-2 shadow-[0_0_24px_rgba(192,132,252,0.18)]">
      <div className="mb-1 flex items-center justify-between text-sm font-bold uppercase">
        <span className="text-purple-300">{primaryTarget.name}</span>
        <span className="text-cyan-200">Primary Target</span>
      </div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-cyan-300">
        <span>Integrity</span>
        <span>
          {primaryTarget.health} / {primaryTarget.maxHealth}
        </span>
      </div>
      <div className="h-3 overflow-hidden bg-[#18080d]">
        <div
          className="h-full bg-fuchsia-500"
          style={{ width: String(healthPercent) + "%" }}
        />
      </div>
    </div>
  );
}
