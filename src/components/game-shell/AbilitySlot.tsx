import Image from "next/image";
import { useRef } from "react";
import type { AbilitySlotProps } from "./types";

export function AbilitySlot({
  icon,
  imageSrc,
  label,
  shortcutLabel,
  locked = false,
  active = false,
  cooldownProgress = 0,
  size = "default",
  onClick,
  onKeyDown,
  onInfoClick,
}: AbilitySlotProps) {
  const lastPointerActivationAtRef = useRef(0);
  const clampedCooldownProgress = Math.min(1, Math.max(0, cooldownProgress));
  const cooldownDegrees = clampedCooldownProgress * 360;
  const cooldownOverlayColor = "rgba(224, 242, 254, 0.32)";
  const cooldownMask =
    clampedCooldownProgress >= 0.995
      ? cooldownOverlayColor
      : `conic-gradient(from 0deg, ${cooldownOverlayColor} 0deg ${cooldownDegrees}deg, transparent ${cooldownDegrees}deg 360deg)`;
  const isMobile = size === "mobile";
  const sizeClass = isMobile ? "h-[72px] w-[72px]" : "h-24 w-24";
  const iconContainerClass = isMobile
    ? "absolute inset-0 flex items-center justify-center overflow-hidden bg-[#081a23] text-xl"
    : "relative flex h-14 w-14 items-center justify-center overflow-hidden rounded border border-cyan-300/20 bg-[#081a23] text-3xl";

  return (
    <div
      className={`pointer-events-auto relative bg-black/75 transition ${sizeClass} ${
        active
          ? "border-2 border-cyan-300 bg-cyan-500/10 shadow-[0_0_30px_rgba(56,189,248,0.25)]"
          : isMobile
            ? "border border-cyan-300/30"
            : "border-2 border-cyan-300/30"
      } ${locked ? "opacity-60" : ""}`}
    >
      {shortcutLabel ? (
        <div className="absolute -left-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center border border-cyan-200/70 bg-black px-2 text-xs font-black text-cyan-100 shadow-[0_0_14px_rgba(56,189,248,0.25)]">
          {shortcutLabel}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (
            isMobile &&
            Date.now() - lastPointerActivationAtRef.current < 700
          ) {
            return;
          }

          onClick?.();
        }}
        onPointerDown={(event) => {
          if (!isMobile || event.pointerType === "mouse") {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          lastPointerActivationAtRef.current = Date.now();
          onClick?.();
        }}
        onKeyDown={onKeyDown}
        disabled={locked}
        tabIndex={onClick ? 0 : -1}
        className={`relative flex h-full w-full touch-none flex-col items-center justify-center overflow-hidden transition ${
          locked
            ? "cursor-not-allowed"
            : onClick
              ? "cursor-pointer hover:border-cyan-200"
              : "cursor-default"
        }`}
      >
        <div className={iconContainerClass}>
          {locked ? (
            <span
              className={isMobile ? "text-[10px] text-zinc-500" : "text-zinc-500"}
            >
              Lock
            </span>
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
        <div
          className={
            isMobile
              ? "absolute inset-x-0 bottom-0 bg-black/65 px-1 py-0.5 text-center text-[10px] font-black leading-none text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]"
              : "mt-1 text-xs font-bold text-white sm:mt-2 sm:text-sm"
          }
        >
          {label}
        </div>
      </button>

      {!locked && onInfoClick ? (
        <button
          type="button"
          className={`absolute cursor-pointer items-center justify-center rounded-full border border-cyan-200/60 bg-black/80 font-bold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-500/25 ${
            isMobile
              ? "right-1 top-1 flex h-5 w-5 text-[10px]"
              : "right-1 top-1 flex h-6 w-6 text-xs"
          }`}
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
