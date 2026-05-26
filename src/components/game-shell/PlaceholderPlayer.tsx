import type { CSSProperties } from "react";

import {
  PLAYER_PLACEHOLDER_TUNING,
  type PlayerPosition,
} from "@/lib/game/player";

type PlaceholderPlayerProps = {
  position: PlayerPosition;
};

export function PlaceholderPlayer({ position }: PlaceholderPlayerProps) {
  const playerStyle = {
    left: `${position.xPercent}%`,
    top: `${position.groundYPercent}%`,
    width: `${PLAYER_PLACEHOLDER_TUNING.widthPx}px`,
    height: `${PLAYER_PLACEHOLDER_TUNING.heightPx}px`,
    transform: `translate(-50%, -100%) scaleX(${position.facing}) scale(${PLAYER_PLACEHOLDER_TUNING.scale})`,
    transformOrigin: "center bottom",
  } satisfies CSSProperties;

  return (
    <div
      aria-label="Placeholder coder player"
      className="pointer-events-none absolute z-[1] drop-shadow-[0_16px_14px_rgba(0,0,0,0.45)]"
      data-testid="placeholder-player"
      role="img"
      style={playerStyle}
    >
      <div className="absolute bottom-[-4%] left-1/2 h-[8%] w-[82%] -translate-x-1/2 rounded-full bg-black/45 blur-[1px]" />

      <div className="absolute left-[18%] top-[5%] h-[26%] w-[64%] rounded-t-full border-2 border-cyan-100 bg-[#f2bd91]" />
      <div className="absolute left-[14%] top-[2%] h-[15%] w-[72%] rounded-t-full bg-[#171923]" />
      <div className="absolute left-[26%] top-[17%] h-[5%] w-[16%] border border-[#172031] bg-cyan-100" />
      <div className="absolute right-[26%] top-[17%] h-[5%] w-[16%] border border-[#172031] bg-cyan-100" />
      <div className="absolute left-[42%] top-[19%] h-px w-[16%] bg-[#172031]" />

      <div className="absolute left-[11%] top-[30%] h-[42%] w-[78%] rounded-t-xl border-2 border-cyan-100 bg-[#0891b2]" />
      <div className="absolute left-[24%] top-[37%] h-[22%] w-[52%] border border-cyan-200/80 bg-[#101826]" />
      <div className="absolute left-[31%] top-[43%] h-[3%] w-[14%] bg-emerald-300" />
      <div className="absolute right-[31%] top-[43%] h-[3%] w-[14%] bg-emerald-300" />
      <div className="absolute left-[38%] top-[50%] h-[3%] w-[24%] bg-cyan-300" />

      <div className="absolute left-[1%] top-[35%] h-[34%] w-[18%] rounded-full bg-[#22d3ee]" />
      <div className="absolute right-[1%] top-[35%] h-[34%] w-[18%] rounded-full bg-[#22d3ee]" />
      <div className="absolute -right-[7%] top-[28%] h-[24%] w-[18%] rotate-6 border-2 border-cyan-200 bg-[#0d1824]" />

      <div className="absolute bottom-0 left-[24%] h-[31%] w-[17%] rounded-b-md bg-[#0f2f44]" />
      <div className="absolute bottom-0 right-[24%] h-[31%] w-[17%] rounded-b-md bg-[#0f2f44]" />
      <div className="absolute bottom-0 left-[17%] h-[6%] w-[27%] rounded bg-cyan-100" />
      <div className="absolute bottom-0 right-[17%] h-[6%] w-[27%] rounded bg-cyan-100" />
    </div>
  );
}
