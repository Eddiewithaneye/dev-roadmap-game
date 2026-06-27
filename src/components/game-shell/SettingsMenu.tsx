import type { SettingsMenuProps } from "./types";
import { useGameStore } from "../game/stores/useGameStore";

export function SettingsMenu({
  isDevMode,
  onDevModeChange,
}: SettingsMenuProps) {
  const cred = useGameStore((state) => state.cred);

  return (
    <section className="pointer-events-auto absolute right-6 top-24 z-30 w-64 border border-cyan-300/30 bg-black/80 p-3 shadow-[0_0_32px_rgba(8,145,178,0.18)]">
      <div className="mb-3 text-sm font-bold uppercase tracking-wide text-cyan-200">
        Settings
      </div>
      <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-white">
        <span>Dev Mode</span>
        <input
          checked={isDevMode}
          className="h-4 w-4 accent-cyan-300"
          onChange={(event) => onDevModeChange(event.target.checked)}
          type="checkbox"
        />
      </label>
      <div className="mt-4 border-t border-cyan-300/20 pt-3">
        <div className="text-xs font-bold uppercase tracking-wide text-cyan-200">
          Cred Marketplace
        </div>
        <div className="mt-2 text-sm font-bold text-white">
          {cred.toLocaleString()} Cred banked
        </div>
        <button
          type="button"
          className="mt-3 w-full cursor-not-allowed border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-100 opacity-70"
          disabled
        >
          Marketplace pending
        </button>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Cred earning is wired; persistent spending is the next marketplace pass.
        </p>
      </div>
    </section>
  );
}
