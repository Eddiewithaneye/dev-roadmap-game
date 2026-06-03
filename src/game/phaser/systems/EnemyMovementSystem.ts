import * as Phaser from "phaser";

import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { ArenaRect } from "@/game/domain/types";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { getDepthScale } from "@/game/phaser/worldDepth";

type WispState = {
  nextSwitchAt: number;
  isWalking: boolean;
  nextMeleeAt: number;
};

const WISP_MELEE_RANGE = 100;
const WISP_MELEE_DAMAGE = 8;
const WISP_MELEE_COOLDOWN_MS = 1350;
const WISP_WALK_DURATION_MS = 650;
const WISP_STOP_DURATION_MS = 360;

export class EnemyMovementSystem {
  private readonly directions = new Map<EnemyActor, -1 | 1>();
  private readonly wispStates = new Map<EnemyActor, WispState>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemies: EnemyActor[],
    private readonly player: PlayerActor,
    private readonly walkableArea: ArenaRect,
  ) {}

  update(time: number, deltaMs: number) {
    const forwardLimit = this.walkableArea.x + this.walkableArea.width * 0.66;
    const backwardLimit = this.walkableArea.x + this.walkableArea.width * 0.78;

    for (const enemy of this.enemies) {
      if (enemy.isDefeated()) {
        continue;
      }

      if (enemy.definition.id === "syntax-wisp") {
        this.updateSyntaxWisp(enemy, time, deltaMs);
        continue;
      }

      this.updateColossus(enemy, deltaMs, forwardLimit, backwardLimit);
      enemy.setDepthScale(getDepthScale(enemy.container.y, this.walkableArea));
    }
  }

  private updateColossus(
    enemy: EnemyActor,
    deltaMs: number,
    forwardLimit: number,
    backwardLimit: number,
  ) {
      const currentDirection = this.directions.get(enemy) ?? -1;
      let nextDirection = currentDirection;

      if (enemy.container.x <= forwardLimit) {
        nextDirection = 1;
      } else if (enemy.container.x >= backwardLimit) {
        nextDirection = -1;
      }

      this.directions.set(enemy, nextDirection);
      enemy.container.x += nextDirection * Math.min(deltaMs, 50) * 0.014;
  }

  private updateSyntaxWisp(enemy: EnemyActor, time: number, deltaMs: number) {
    const state = this.getWispState(enemy, time);

    if (time >= state.nextSwitchAt) {
      state.isWalking = !state.isWalking;
      state.nextSwitchAt =
        time + (state.isWalking ? WISP_WALK_DURATION_MS : WISP_STOP_DURATION_MS);
    }

    const dx = this.player.container.x - enemy.container.x;
    const dy = this.player.container.y - enemy.container.y;
    const distance = Math.hypot(dx, dy);

    if (state.isWalking && distance > WISP_MELEE_RANGE * 0.72) {
      const step = enemy.definition.speed * Math.min(deltaMs, 50) * 0.001;
      enemy.container.x += (dx / Math.max(1, distance)) * step;
      enemy.container.y = Phaser.Math.Clamp(
        enemy.container.y + (dy / Math.max(1, distance)) * step,
        this.walkableArea.y,
        this.walkableArea.y + this.walkableArea.height,
      );
      enemy.container.setDepth(enemy.container.y);
      enemy.setDepthScale(getDepthScale(enemy.container.y, this.walkableArea));
    }

    if (distance <= WISP_MELEE_RANGE && time >= state.nextMeleeAt) {
      state.nextMeleeAt = time + WISP_MELEE_COOLDOWN_MS;
      this.meleeSwipe(enemy, distance);
    }
  }

  private getWispState(enemy: EnemyActor, time: number) {
    const existing = this.wispStates.get(enemy);

    if (existing) {
      return existing;
    }

    const state = {
      nextSwitchAt: time + WISP_WALK_DURATION_MS,
      isWalking: true,
      nextMeleeAt: time + 600,
    };
    this.wispStates.set(enemy, state);

    return state;
  }

  private meleeSwipe(enemy: EnemyActor, distance: number) {
    const swipe = this.scene.add
      .arc(enemy.container.x, enemy.container.y - 36, 54, 20, 340, false)
      .setStrokeStyle(5, 0x67e8f9, 0.9)
      .setDepth(enemy.container.y + 18);

    this.scene.tweens.add({
      targets: swipe,
      alpha: 0,
      rotation: Math.PI * 1.6,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 260,
      onComplete: () => swipe.destroy(),
    });

    if (distance <= WISP_MELEE_RANGE) {
      window.dispatchEvent(
        new CustomEvent("codebound:enemy-projectile-hit", {
          detail: { damage: WISP_MELEE_DAMAGE },
        }),
      );
    }
  }
}
