import type { DevControlsProps } from "./types";

export function DevControls({
  health,
  xp,
  xpGoal,
  enemies,
  weaponPanelMode,
  setHealth,
  setCodeFragments,
  setCred,
  setXp,
  setEnemies,
  setWeaponPanelMode,
}: DevControlsProps) {
  return (
    <div className="pointer-events-auto flex flex-wrap justify-center gap-3">
      <button
        className="border border-cyan-300/40 bg-black/60 px-4 py-2"
        onClick={() => setHealth(Math.max(0, health - 10))}
      >
        Take Damage
      </button>
      <button
        className="border border-cyan-300/40 bg-black/60 px-4 py-2"
        onClick={() => setCodeFragments((value) => value + 100)}
      >
        Add Fragments
      </button>
      <button
        className="border border-cyan-300/40 bg-black/60 px-4 py-2"
        onClick={() => setCred((value) => value + 50)}
      >
        Add Cred
      </button>
      <button
        className="border border-cyan-300/40 bg-black/60 px-4 py-2"
        onClick={() => setXp(Math.min(xpGoal, xp + 125))}
      >
        Add XP
      </button>
      <button
        className="border border-cyan-300/40 bg-black/60 px-4 py-2"
        onClick={() => setEnemies(Math.max(0, enemies - 1))}
      >
        Defeat Enemy
      </button>
      <button
        className="border border-cyan-300/40 bg-black/60 px-4 py-2"
        onClick={() =>
          setWeaponPanelMode((mode) => (mode === "dev" ? "player" : "dev"))
        }
      >
        Weapon Panel: {weaponPanelMode}
      </button>
    </div>
  );
}
