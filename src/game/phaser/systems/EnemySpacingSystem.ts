import * as Phaser from "phaser";

import type { ArenaRect } from "@/game/domain/types";
import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";

type EnemySpacingOptions = {
  horizontalAwareness?: number;
  minHorizontalGap?: number;
  minDepthGap?: number;
  minX?: number;
  maxX?: number;
  maxPushX?: number;
  maxPushY?: number;
};

const DEFAULT_HORIZONTAL_AWARENESS = 104;
const DEFAULT_MIN_HORIZONTAL_GAP = 42;
const DEFAULT_MIN_DEPTH_GAP = 24;
const DEFAULT_MAX_PUSH_X = 12;
const DEFAULT_MAX_PUSH_Y = 18;
const MINIBOSS_GAP_MULTIPLIER = 1.8;

export function resolveEnemyPosition(
  enemy: EnemyActor,
  desiredX: number,
  desiredY: number,
  enemies: EnemyActor[],
  walkableArea: ArenaRect,
  options: EnemySpacingOptions = {},
) {
  const horizontalAwareness =
    options.horizontalAwareness ?? DEFAULT_HORIZONTAL_AWARENESS;
  const minHorizontalGap =
    options.minHorizontalGap ?? DEFAULT_MIN_HORIZONTAL_GAP;
  const minDepthGap = options.minDepthGap ?? DEFAULT_MIN_DEPTH_GAP;
  const maxPushX = options.maxPushX ?? DEFAULT_MAX_PUSH_X;
  const maxPushY = options.maxPushY ?? DEFAULT_MAX_PUSH_Y;
  let pushX = 0;
  let pushY = 0;

  for (const otherEnemy of enemies) {
    if (otherEnemy === enemy || otherEnemy.isDefeated()) {
      continue;
    }

    const dx = desiredX - otherEnemy.container.x;
    const dy = desiredY - otherEnemy.container.y;
    const requiredXGap =
      minHorizontalGap *
      (enemy.isMiniBoss || otherEnemy.isMiniBoss ? MINIBOSS_GAP_MULTIPLIER : 1);
    const requiredYGap =
      minDepthGap *
      (enemy.isMiniBoss || otherEnemy.isMiniBoss ? MINIBOSS_GAP_MULTIPLIER : 1);

    if (Math.abs(dx) >= horizontalAwareness || Math.abs(dy) >= requiredYGap) {
      continue;
    }

    const normalizedX = dx / requiredXGap;
    const normalizedY = dy / requiredYGap;
    const distance = Math.max(0.001, Math.hypot(normalizedX, normalizedY));

    if (distance >= 1) {
      continue;
    }

    const fallbackDirection = getFallbackDirection(enemy, otherEnemy, enemies);
    const directionX = dx === 0 ? fallbackDirection.x : Math.sign(dx);
    const directionY = dy === 0 ? fallbackDirection.y : Math.sign(dy);
    const closeness = 1 - distance;

    pushX += directionX * maxPushX * closeness;
    pushY += directionY * maxPushY * closeness;
  }

  return {
    x: Phaser.Math.Clamp(
      desiredX + Phaser.Math.Clamp(pushX, -maxPushX, maxPushX),
      options.minX ?? walkableArea.x,
      options.maxX ?? walkableArea.x + walkableArea.width,
    ),
    y: Phaser.Math.Clamp(
      desiredY + Phaser.Math.Clamp(pushY, -maxPushY, maxPushY),
      walkableArea.y,
      walkableArea.y + walkableArea.height,
    ),
  };
}

export function resolveEnemyDepthLane(
  enemy: EnemyActor,
  desiredY: number,
  enemies: EnemyActor[],
  walkableArea: ArenaRect,
  options: EnemySpacingOptions = {},
) {
  return resolveEnemyPosition(
    enemy,
    enemy.container.x,
    desiredY,
    enemies,
    walkableArea,
    { ...options, maxPushX: 0 },
  ).y;
}

function getFallbackDirection(
  enemy: EnemyActor,
  otherEnemy: EnemyActor,
  enemies: EnemyActor[],
) {
  const direction = enemies.indexOf(enemy) > enemies.indexOf(otherEnemy) ? 1 : -1;

  return { x: direction, y: -direction };
}
