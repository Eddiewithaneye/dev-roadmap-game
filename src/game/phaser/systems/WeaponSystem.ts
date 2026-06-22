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
import type { WeaponEffect } from "@/types/weapon";

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

  fire(effect: WeaponEffect, damage: number, range: number) {
    if (effect === "straight-shot") {
      this.fireStraightShot(damage, range);
      return;
    }

    this.fireChainSpark(damage);
  }

  private fireChainSpark(damage: number) {
    const target = this.getClosestLiveEnemy();

    if (!target) {
      return;
    }

    WeaponEffects.spark(
      this.scene,
      this.player.getCastOrigin(),
      target.container,
    );
    this.applyHit(target, damage);
  }

  private fireStraightShot(damage: number, range: number) {
    const direction = this.player.getFacing();
    const rangePixels = Math.min(
      range * STRAIGHT_SHOT_RANGE_UNIT_PX,
      this.scene.scale.width * 0.92,
    );
    const hitbox = getStraightShotHitbox(
      this.player.container,
      direction,
      rangePixels,
    );
    const hits = this.enemies
      .filter((enemy) => this.isEnemyInStraightShot(enemy, hitbox))
      .map((enemy) => ({
        enemy,
        distance: getDistanceToEnemy(enemy, direction, hitbox),
      }))
      .sort((a, b) => a.distance - b.distance);

    WeaponEffects.straightShot(
      this.scene,
      this.player.container,
      direction,
      rangePixels,
      {
        debugHitbox: hitbox,
        showDebug: this.isDevMode,
      },
    );

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
        this.applyHit(enemy, damage);
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

  private getClosestLiveEnemy() {
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
      .sort((a, b) => a.distance - b.distance)[0]?.enemy;
  }

  private applyHit(enemy: EnemyActor, damage: number) {
    if (!enemy.applyDamage(this.scene, damage)) {
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
    playHitShake(this.scene, intensity);

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
) {
  const startX = player.x + direction * 34;
  const top = player.y - 56 - STRAIGHT_SHOT_WIDTH / 2;

  return new Phaser.Geom.Rectangle(
    direction === 1 ? startX : startX - rangePixels,
    top,
    rangePixels,
    STRAIGHT_SHOT_WIDTH,
  );
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
