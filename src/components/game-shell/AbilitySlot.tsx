import Image from "next/image";
import type { AbilitySlotProps } from "./types";

export function AbilitySlot({
  icon,
  imageSrc,
  label,
  shortcutLabel,
  locked = false,
  active = false,
  cooldownProgress = 0,
  onClick,
  onKeyDown,
  onInfoClick,
}: AbilitySlotProps) {
  const clampedCooldownProgress = Math.min(1, Math.max(0, cooldownProgress));
  const cooldownDegrees = clampedCooldownProgress * 360;
  const cooldownOverlayColor = "rgba(224, 242, 254, 0.32)";
  const cooldownMask =
    clampedCooldownProgress >= 0.995
      ? cooldownOverlayColor
      : `conic-gradient(from 0deg, ${cooldownOverlayColor} 0deg ${cooldownDegrees}deg, transparent ${cooldownDegrees}deg 360deg)`;

  return (
    <div
      className={`pointer-events-auto relative h-24 w-24 border-2 bg-black/75 transition ${
        active
          ? "border-cyan-300 bg-cyan-500/10 shadow-[0_0_30px_rgba(56,189,248,0.25)]"
          : "border-cyan-300/30"
      } ${locked ? "opacity-60" : ""}`}
    >
      {shortcutLabel ? (
        <div className="absolute -left-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center border border-cyan-200/70 bg-black px-2 text-xs font-black text-cyan-100 shadow-[0_0_14px_rgba(56,189,248,0.25)]">
          {shortcutLabel}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onClick}
        onKeyDown={onKeyDown}
        disabled={locked}
        tabIndex={onClick ? 0 : -1}
        className={`flex h-full w-full flex-col items-center justify-center transition ${
          locked
            ? "cursor-not-allowed"
            : onClick
              ? "cursor-pointer hover:border-cyan-200"
              : "cursor-default"
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
          {clampedCooldownProgress > 0 ? (
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: cooldownMask }}
            />
          ) : null}
        </div>
        <div className="mt-2 text-sm font-bold text-white">{label}</div>
      </button>

      {!locked && onInfoClick ? (
        <button
          type="button"
          className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-cyan-200/60 bg-black/80 text-xs font-bold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-500/25"
          onClick={onInfoClick}
          onKeyDown={preventSpacePropagation}
          aria-label={`Open ${label} weapon details`}
        >
          i
        </button>
      ) : null}
    </div>
  );
}

function preventSpacePropagation(event: React.KeyboardEvent<HTMLButtonElement>) {
  if (event.key === " ") {
    event.preventDefault();
    event.stopPropagation();
  }
}
