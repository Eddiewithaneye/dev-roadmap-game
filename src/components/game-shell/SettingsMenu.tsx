import type { SettingsMenuProps } from "./types";

export function SettingsMenu({
  isDevMode,
  onDevModeChange,
}: SettingsMenuProps) {
  return (
    <section className="pointer-events-auto absolute right-6 top-24 z-30 w-56 border border-cyan-300/30 bg-black/80 p-3 shadow-[0_0_32px_rgba(8,145,178,0.18)]">
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
    </section>
  );
}
