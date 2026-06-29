import { ARENA_LAYOUT } from "@/game/config/arena";
import { WORLD_Z, type DepthScaleProfile } from "@/game/phaser/worldDepth";

const MIN_GAMEPLAY_SCALE = 0.58;
const MAX_GAMEPLAY_SCALE = 1;
const MOBILE_LANDSCAPE_DEPTH_PROFILE = {
  minScale: 0.7,
  maxScale: 0.95,
} as const satisfies DepthScaleProfile;

export function getGameplayScale(width: number, height: number) {
  const rawScale = Math.min(
    width / ARENA_LAYOUT.camera.width,
    height / ARENA_LAYOUT.camera.height,
  );

  return Math.min(MAX_GAMEPLAY_SCALE, Math.max(MIN_GAMEPLAY_SCALE, rawScale));
}

export function getDepthScaleProfile(
  width: number,
  height: number,
): DepthScaleProfile {
  if (height <= 520 && width > height) {
    return MOBILE_LANDSCAPE_DEPTH_PROFILE;
  }

  return WORLD_Z;
}
