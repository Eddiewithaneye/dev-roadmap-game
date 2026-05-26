import type { AbilitySlotProps } from "./types";

export function AbilitySlot({ icon, label, locked = false }: AbilitySlotProps) {
  return (
    <div className="flex h-24 w-24 flex-col items-center justify-center border-2 border-cyan-300/30 bg-black/75">
      <div
        className={locked ? "text-3xl text-zinc-500" : "text-3xl text-cyan-300"}
      >
        {locked ? "🔒" : icon}
      </div>
      <div className="mt-2 text-sm font-bold text-white">{label}</div>
    </div>
  );
}
