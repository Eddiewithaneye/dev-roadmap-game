import type { DevControlsProps } from "./types";

const panelPositionClass = {
  top: "left-1/2 top-24 -translate-x-1/2",
  left: "left-6 top-28",
  right: "right-6 top-28",
};

const actionButtonClass =
  "cursor-pointer border border-cyan-300/40 bg-black/60 px-4 py-2 transition hover:border-cyan-200 hover:bg-cyan-500/10";

export function DevControls({
  health,
  xp,
  xpGoal,
  enemies,
  position,
  setHealth,
  setCodeFragments,
  setCred,
  setXp,
  setEnemies,
  setPosition,
}: DevControlsProps) {
  return (
    <section
      className={`pointer-events-auto absolute z-20 max-w-[min(760px,calc(100vw-48px))] border border-cyan-300/30 bg-black/70 p-3 shadow-[0_0_32px_rgba(8,145,178,0.16)] ${panelPositionClass[position]}`}
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold uppercase tracking-wide text-cyan-200">
            Dev Tools
          </div>
          <div className="text-xs text-slate-300">Prototype state controls</div>
        </div>
        <div className="flex gap-1">
          <PositionButton
            active={position === "top"}
            label="Top"
            onClick={() => setPosition("top")}
          />
          <PositionButton
            active={position === "left"}
            label="Left"
            onClick={() => setPosition("left")}
          />
          <PositionButton
            active={position === "right"}
            label="Right"
            onClick={() => setPosition("right")}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          className={actionButtonClass}
          onClick={() => setHealth(Math.max(0, health - 10))}
        >
          Take Damage
        </button>
        <button
          className={actionButtonClass}
          onClick={() => setCodeFragments((value) => value + 100)}
        >
          Add Fragments
        </button>
        <button
          className={actionButtonClass}
          onClick={() => setCred((value) => value + 50)}
        >
          Add Cred
        </button>
        <button
          className={actionButtonClass}
          onClick={() => setXp(Math.min(xpGoal, xp + 125))}
        >
          Add XP
        </button>
        <button
          className={actionButtonClass}
          onClick={() => setEnemies(Math.max(0, enemies - 1))}
        >
          Defeat Enemy
        </button>
      </div>
    </section>
  );
}

function PositionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`cursor-pointer border px-2 py-1 text-xs font-bold transition hover:border-cyan-200 hover:bg-cyan-500/10 ${
        active
          ? "border-cyan-300 bg-cyan-500/20 text-cyan-100"
          : "border-cyan-300/30 bg-black/50 text-cyan-200"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
