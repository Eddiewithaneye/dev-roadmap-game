import Image from "next/image";
import type { AbilitySlotProps } from "./types";

export function AbilitySlot({
  icon,
  imageSrc,
  label,
  locked = false,
  active = false,
  onClick,
}: AbilitySlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`pointer-events-auto flex h-24 w-24 flex-col items-center justify-center border-2 bg-black/75 transition ${
        active
          ? "border-cyan-300 bg-cyan-500/10 shadow-[0_0_30px_rgba(56,189,248,0.25)]"
          : "border-cyan-300/30"
      } ${
        locked
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-cyan-200"
      }`}
    >
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded border border-cyan-300/20 bg-[#081a23] text-3xl">
        {locked ? (
          <span className="text-zinc-500">Lock</span>
        ) : imageSrc ? (
          <Image src={imageSrc} alt={label} fill className="object-cover" />
        ) : (
          <span className="text-cyan-300">{icon}</span>
        )}
      </div>
      <div className="mt-2 text-sm font-bold text-white">{label}</div>
    </button>
  );
}
