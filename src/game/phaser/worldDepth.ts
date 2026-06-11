import type { ArenaRect } from "@/game/domain/types";

export const WORLD_Z = {
  min: -1,
  max: 1,
  center: 0,
  minScale: 0.75,
  maxScale: 1.25,
} as const;

export function getWorldZ(y: number, walkableArea: ArenaRect) {
  const progress =
    (y - walkableArea.y) / Math.max(1, walkableArea.height);

  return WORLD_Z.min + progress * (WORLD_Z.max - WORLD_Z.min);
}

export function getDepthScale(y: number, walkableArea: ArenaRect) {
  const progress =
    (y - walkableArea.y) / Math.max(1, walkableArea.height);

  return WORLD_Z.minScale + progress * (WORLD_Z.maxScale - WORLD_Z.minScale);
}
