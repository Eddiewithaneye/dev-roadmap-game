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
    private readonly enemy: EnemyActor,
  ) {}

  fire(effect: WeaponEffect, damage: number, range: number) {
    if (effect === "straight-shot") {
      this.fireStraightShot(damage, range);
      return;
    }

    WeaponEffects.spark(this.scene, this.player.container, this.enemy.container);
  }

  private fireStraightShot(damage: number, range: number) {
    const direction = this.player.getFacing();
    const playerX = this.player.container.x;
    const enemyBounds = this.enemy.container.getBounds();
    const rangePixels = Math.min(
      range * STRAIGHT_SHOT_RANGE_UNIT_PX,
      this.scene.scale.width * 0.92,
    );
    const distanceToEnemy =
      direction === 1
        ? enemyBounds.left - playerX
        : playerX - enemyBounds.right;
    const isAhead =
      direction === 1
        ? enemyBounds.left >= playerX
        : enemyBounds.right <= playerX;
    const isInRange = distanceToEnemy <= rangePixels;
    const laneOverlap =
      Math.abs(this.enemy.container.y - this.player.container.y) <=
      STRAIGHT_SHOT_WIDTH / 2;

    WeaponEffects.straightShot(
      this.scene,
      this.player.container,
      direction,
      rangePixels,
    );

    if (!isAhead || !isInRange || !laneOverlap) {
      return;
    }

    const hitDelay = Math.max(
      80,
      (distanceToEnemy / STRAIGHT_SHOT_SPEED_PX_PER_SECOND) * 1000,
    );
    this.scene.time.delayedCall(hitDelay, () => {
      DamageNumberEffects.show(
        this.scene,
        this.enemy.container.x,
        this.enemy.container.y - 82,
        damage,
      );
      HitFeedbackEffects.flash(this.scene, this.enemy.container);
      window.dispatchEvent(
        new CustomEvent("codebound:player-projectile-hit", {
          detail: { damage },
        }),
      );
    });
  }
}
