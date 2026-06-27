import { useGameStore } from "../game/stores/useGameStore";
import type { DevControlsProps } from "./types";

const panelPositionClass = {
  top: "left-1/2 top-24 -translate-x-1/2",
  left: "left-6 top-28",
  right: "right-6 top-52",
};

const actionButtonClass =
  "cursor-pointer border border-cyan-300/40 bg-black/60 px-4 py-2 transition hover:border-cyan-200 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50";
const activeDevButtonClass = "border-emerald-300/70 bg-emerald-500/15";

export function DevControls({
  isMinimized,
  isRunTimerPaused,
  onMinimizedChange,
  onRunTimerPause,
  onRunTimerPlay,
  onRunTimerRestart,
  onSkipToMiniboss,
  onSpawnEnemy,
  position,
  setPosition,
}: DevControlsProps) {
  const takeDamage = useGameStore((state) => state.takeDamage);
  const grantCodeFragments = useGameStore((state) => state.grantCodeFragments);
  const grantCred = useGameStore((state) => state.grantCred);
  const grantXp = useGameStore((state) => state.grantXp);
  const currentMovementSpeed = useGameStore(
    (state) => state.currentMovementSpeed,
  );
  const isInvulnerable = useGameStore((state) => state.isInvulnerable);
  const setInvulnerable = useGameStore((state) => state.setInvulnerable);
  const isSidePosition = position === "left" || position === "right";

  if (isMinimized) {
    return (
      <button
        type="button"
        className={`pointer-events-auto absolute z-20 border border-cyan-300/40 bg-black/70 px-2 py-1 text-xs font-bold text-cyan-100 shadow-[0_0_24px_rgba(8,145,178,0.16)] transition hover:border-cyan-200 hover:bg-cyan-500/10 ${panelPositionClass[position]}`}
        onClick={() => onMinimizedChange(false)}
        aria-label="Show dev tools"
      >
        + Dev
      </button>
    );
  }

  return (
    <section
      className={`pointer-events-auto absolute z-20 max-w-[min(760px,calc(100vw-48px))] overflow-y-auto border border-cyan-300/30 bg-black/70 p-3 shadow-[0_0_32px_rgba(8,145,178,0.16)] ${panelPositionClass[position]}`}
      style={{
        maxHeight:
          position === "right" ? "calc(100vh - 14rem)" : "calc(100vh - 7rem)",
      }}
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
          <button
            type="button"
            className="flex h-7 w-7 cursor-pointer items-center justify-center border border-cyan-300/30 bg-black/50 text-sm font-bold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-500/10"
            onClick={() => onMinimizedChange(true)}
            aria-label="Minimize dev tools"
          >
            -
          </button>
        </div>
      </div>

      <section className="mb-3 border border-cyan-300/20 bg-black/40 p-2 text-xs text-slate-200">
        <div className="mb-2 font-bold uppercase tracking-wide text-cyan-200">
          Stats
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Player Speed</span>
          <span className="font-mono text-cyan-100">
            {currentMovementSpeed} px/s
          </span>
        </div>
      </section>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          className={actionButtonClass}
          onClick={onRunTimerPlay}
          disabled={!isRunTimerPaused}
          aria-label="Play sprint timer"
        >
          Play
        </button>
        <button
          type="button"
          className={actionButtonClass}
          onClick={onRunTimerPause}
          disabled={isRunTimerPaused}
          aria-label="Pause sprint timer"
        >
          Pause
        </button>
        <button
          type="button"
          className={actionButtonClass}
          onClick={onRunTimerRestart}
          aria-label="Restart sprint timer"
        >
          Refresh
        </button>
      </div>

      <div
        className={
          isSidePosition
            ? "flex flex-col gap-3"
            : "flex flex-wrap justify-center gap-3"
        }
      >
        <button className={actionButtonClass} onClick={() => takeDamage(10)}>
          Take Damage
        </button>
        <button
          className={actionButtonClass}
          onClick={() => grantCodeFragments(100)}
        >
          Add Fragments
        </button>
        <button className={actionButtonClass} onClick={() => grantCred(100)}>
          Add Cred
        </button>
        <button className={actionButtonClass} onClick={() => grantXp(100)}>
          Add XP
        </button>
        <button className={actionButtonClass} onClick={onSpawnEnemy}>
          Spawn Enemy
        </button>
        <button className={actionButtonClass} onClick={onSkipToMiniboss}>
          Skip to miniboss
        </button>
        <button
          className={
            isInvulnerable
              ? `${actionButtonClass} ${activeDevButtonClass}`
              : actionButtonClass
          }
          onClick={() => setInvulnerable(!isInvulnerable)}
        >
          Invulnerable: {isInvulnerable ? "On" : "Off"}
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
