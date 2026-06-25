import type { ArenaRect } from "@/game/domain/types";

export const WORLD_Z = {
  min: -1,
  max: 1,
  center: 0,
  minScale: 0.5,
  maxScale: 1.25,
  minMovementSpeedScale: 0.76,
  maxMovementSpeedScale: 1.40,
} as const;

export function getWorldZ(y: number, walkableArea: ArenaRect) {
  const progress = getWalkableProgress(y, walkableArea);

  return WORLD_Z.min + progress * (WORLD_Z.max - WORLD_Z.min);
}

export function getDepthScale(y: number, walkableArea: ArenaRect) {
  const progress = getWalkableProgress(y, walkableArea);

  return WORLD_Z.minScale + progress * (WORLD_Z.maxScale - WORLD_Z.minScale);
}

export function getMovementSpeedScale(y: number, walkableArea: ArenaRect) {
  const progress = getWalkableProgress(y, walkableArea);

  return (
    WORLD_Z.minMovementSpeedScale +
    (WORLD_Z.maxMovementSpeedScale - WORLD_Z.minMovementSpeedScale) * progress
  );
}

function getWalkableProgress(y: number, walkableArea: ArenaRect) {
  return Math.min(
    1,
    Math.max(0, (y - walkableArea.y) / Math.max(1, walkableArea.height)),
  );
}
