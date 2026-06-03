import * as Phaser from "phaser";

import { DamageNumberEffects } from "@/game/phaser/effects/DamageNumberEffects";
import { HitFeedbackEffects } from "@/game/phaser/effects/HitFeedbackEffects";
import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { WeaponEffects } from "@/game/phaser/effects/WeaponEffects";
import type { WeaponEffect } from "@/types/weapon";

const STRAIGHT_SHOT_WIDTH = 64;
const STRAIGHT_SHOT_RANGE_UNIT_PX = 56;
const STRAIGHT_SHOT_SPEED_PX_PER_SECOND = 980;

export class WeaponSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: PlayerActor,
    private readonly enemies: EnemyActor[],
  ) {}

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

    WeaponEffects.spark(this.scene, this.player.container, target.container);
    this.applyHit(target, damage);
  }

  private fireStraightShot(damage: number, range: number) {
    const direction = this.player.getFacing();
    const playerX = this.player.container.x;
    const rangePixels = Math.min(
      range * STRAIGHT_SHOT_RANGE_UNIT_PX,
      this.scene.scale.width * 0.92,
    );
    const hits = this.enemies
      .filter((enemy) =>
        this.isEnemyInStraightShot(enemy, direction, playerX, rangePixels),
      )
      .map((enemy) => ({
        enemy,
        distance: getDistanceToEnemy(enemy, direction, playerX),
      }))
      .sort((a, b) => a.distance - b.distance);

    WeaponEffects.straightShot(
      this.scene,
      this.player.container,
      direction,
      rangePixels,
    );

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
    direction: -1 | 1,
    playerX: number,
    rangePixels: number,
  ) {
    if (enemy.isDefeated()) {
      return false;
    }

    const distance = getDistanceToEnemy(enemy, direction, playerX);
    const isAhead = distance >= 0;
    const isInRange = distance <= rangePixels;
    const laneOverlap =
      Math.abs(enemy.container.y - this.player.container.y) <=
      STRAIGHT_SHOT_WIDTH / 2;

    return isAhead && isInRange && laneOverlap;
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

    DamageNumberEffects.show(
      this.scene,
      enemy.container.x,
      enemy.container.y - 82,
      damage,
    );
    HitFeedbackEffects.flash(this.scene, enemy.container);
    window.dispatchEvent(
      new CustomEvent("codebound:player-projectile-hit", {
        detail: { damage },
      }),
    );
  }
}

function getDistanceToEnemy(
  enemy: EnemyActor,
  direction: -1 | 1,
  playerX: number,
) {
  const enemyBounds = enemy.container.getBounds();

  return direction === 1
    ? enemyBounds.left - playerX
    : playerX - enemyBounds.right;
}
