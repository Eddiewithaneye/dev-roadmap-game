import * as Phaser from "phaser";

import {
  flashHitTarget,
  getHitIntensity,
  playHitShake,
  pulseHitTarget,
  spawnDamageNumber,
} from "@/game/phaser/feedback/HitFeedback";
import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { WeaponEffects } from "@/game/phaser/effects/WeaponEffects";
import type { ScreenShakeIntensity, WeaponEffect } from "@/types/weapon";

const STRAIGHT_SHOT_WIDTH = 64;
const STRAIGHT_SHOT_RANGE_UNIT_PX = 56;
const STRAIGHT_SHOT_SPEED_PX_PER_SECOND = 980;

export class WeaponSystem {
  private isDevMode = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: PlayerActor,
    private readonly enemies: EnemyActor[],
  ) {}

  setDevMode(isDevMode: boolean) {
    this.isDevMode = isDevMode;
  }

  fire(
    effect: WeaponEffect,
    damage: number,
    range: number,
    screenShakeIntensity: ScreenShakeIntensity,
    options: {
      attackId: string | null;
      projectileCount: number;
      pierce: number;
      bounceCount: number;
    },
  ) {
    if (effect === "straight-shot") {
      this.fireStraightShot(damage, range, screenShakeIntensity, options);
      return;
    }

    this.fireChainSpark(damage, screenShakeIntensity, options);
  }

  private fireChainSpark(
    damage: number,
    screenShakeIntensity: ScreenShakeIntensity,
    options: {
      attackId: string | null;
      projectileCount: number;
      bounceCount: number;
    },
  ) {
    const initialTargets = this.getClosestLiveEnemies(
      Math.max(1, options.projectileCount),
    );

    if (initialTargets.length === 0) {
      return;
    }

    initialTargets.forEach((initialTarget, projectileIndex) => {
      const chain = this.getBounceChain(initialTarget, options.bounceCount);

      chain.forEach((target, bounceIndex) => {
        this.scene.time.delayedCall(projectileIndex * 55 + bounceIndex * 115, () => {
          const previousTarget = chain[bounceIndex - 1];
          const from = previousTarget
            ? {
                x: previousTarget.container.x,
                y: previousTarget.container.y - 48 * previousTarget.container.scaleY,
              }
            : this.player.getCastOrigin();

          WeaponEffects.spark(
            this.scene,
            from,
            target.container,
            { scale: this.player.getDepthScale() },
          );
          this.applyHit(target, damage, screenShakeIntensity, options.attackId);
        });
      });
    });
  }

  private fireStraightShot(
    damage: number,
    range: number,
    screenShakeIntensity: ScreenShakeIntensity,
    options: {
      attackId: string | null;
      projectileCount: number;
      pierce: number;
    },
  ) {
    const direction = this.player.getFacing();
    const scale = this.player.getDepthScale();
    const rangePixels = Math.min(
      range * STRAIGHT_SHOT_RANGE_UNIT_PX,
      this.scene.scale.width * 0.92,
    );
    const projectileCount = Math.max(1, options.projectileCount);
    const projectileOffsets = getProjectileLaneOffsets(projectileCount);
    const hits = projectileOffsets.flatMap((laneOffset) => {
      const hitbox = getStraightShotHitbox(
        this.player.container,
        direction,
        rangePixels,
        scale,
        laneOffset * scale,
      );

      return this.enemies
        .filter((enemy) => this.isEnemyInStraightShot(enemy, hitbox))
        .map((enemy) => ({
          enemy,
          distance: getDistanceToEnemy(enemy, direction, hitbox),
          hitbox,
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 1 + options.pierce);
    });

    projectileOffsets.forEach((laneOffset) => {
      const hitbox = getStraightShotHitbox(
        this.player.container,
        direction,
        rangePixels,
        scale,
        laneOffset * scale,
      );

      WeaponEffects.straightShot(
        this.scene,
        this.player.container,
        direction,
        rangePixels,
        {
          debugHitbox: hitbox,
          laneOffset: laneOffset * scale,
          scale,
          showDebug: this.isDevMode,
        },
      );
    });

    if (this.isDevMode) {
      this.enemies
        .filter((enemy) => !enemy.isDefeated())
        .forEach((enemy) => {
          WeaponEffects.debugRect(this.scene, enemy.getHurtbox());
        });
    }

    hits.forEach(({ enemy, distance }) => {
      const hitDelay = Math.max(
        40,
        (distance / STRAIGHT_SHOT_SPEED_PX_PER_SECOND) * 1000,
      );

      this.scene.time.delayedCall(hitDelay, () => {
        this.applyHit(enemy, damage, screenShakeIntensity, options.attackId);
      });
    });
  }

  private isEnemyInStraightShot(
    enemy: EnemyActor,
    hitbox: Phaser.Geom.Rectangle,
  ) {
    if (enemy.isDefeated()) {
      return false;
    }

    return Phaser.Geom.Intersects.RectangleToRectangle(
      hitbox,
      enemy.getHurtbox(),
    );
  }

  private getClosestLiveEnemies(count: number) {
    return this.enemies
      .filter((enemy) => !enemy.isDefeated())
      .map((enemy) => ({
        enemy,
        distance: Phaser.Math.Distance.Between(
          this.player.container.x,
          this.player.container.y,
          enemy.container.x,
          enemy.container.y,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
      .map(({ enemy }) => enemy);
  }

  private getBounceChain(initialTarget: EnemyActor, bounceCount: number) {
    const chain = [initialTarget];

    while (chain.length < 1 + bounceCount) {
      const previousTarget = chain[chain.length - 1];
      const nextTarget = this.getClosestLiveEnemyFrom(
        previousTarget.container,
        new Set(chain),
      );

      if (!nextTarget) {
        break;
      }

      chain.push(nextTarget);
    }

    return chain;
  }

  private getClosestLiveEnemyFrom(
    position: { x: number; y: number },
    excludedEnemies: Set<EnemyActor>,
  ) {
    return this.enemies
      .filter((enemy) => !enemy.isDefeated() && !excludedEnemies.has(enemy))
      .map((enemy) => ({
        enemy,
        distance: Phaser.Math.Distance.Between(
          position.x,
          position.y,
          enemy.container.x,
          enemy.container.y,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0]?.enemy;
  }

  private applyHit(
    enemy: EnemyActor,
    damage: number,
    screenShakeIntensity: ScreenShakeIntensity,
    attackId: string | null,
  ) {
    if (!enemy.applyDamage(this.scene, damage, attackId)) {
      return;
    }

    const intensity = getHitIntensity(damage);

    spawnDamageNumber(
      this.scene,
      enemy.container.x,
      enemy.container.y - 82,
      damage,
      {
        intensity,
      },
    );
    playHitShake(this.scene, screenShakeIntensity);

    if (!enemy.isDefeated()) {
      flashHitTarget(this.scene, enemy.container, intensity);
      pulseHitTarget(this.scene, enemy.container, intensity);
    }
    window.dispatchEvent(
      new CustomEvent("codebound:player-projectile-hit", {
        detail: { damage },
      }),
    );
  }
}

function getStraightShotHitbox(
  player: Phaser.GameObjects.Container,
  direction: -1 | 1,
  rangePixels: number,
  scale: number,
  laneOffset: number,
) {
  const scaledWidth = STRAIGHT_SHOT_WIDTH * scale;
  const startX = player.x + direction * 34 * scale;
  const top = player.y - 56 * scale - scaledWidth / 2 + laneOffset;

  return new Phaser.Geom.Rectangle(
    direction === 1 ? startX : startX - rangePixels,
    top,
    rangePixels,
    scaledWidth,
  );
}

function getProjectileLaneOffsets(projectileCount: number) {
  if (projectileCount <= 1) {
    return [0];
  }

  const spacing = 34;
  const start = -((projectileCount - 1) * spacing) / 2;

  return Array.from({ length: projectileCount }, (_, index) => start + index * spacing);
}

function getDistanceToEnemy(
  enemy: EnemyActor,
  direction: -1 | 1,
  hitbox: Phaser.Geom.Rectangle,
) {
  const enemyHurtbox = enemy.getHurtbox();

  return direction === 1
    ? enemyHurtbox.left - hitbox.left
    : hitbox.right - enemyHurtbox.right;
}
