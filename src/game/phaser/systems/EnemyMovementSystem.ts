import * as Phaser from "phaser";

import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { ArenaRect } from "@/game/domain/types";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { playHitShake } from "@/game/phaser/feedback/HitFeedback";
import type { ScreenShakeIntensity } from "@/types/weapon";
import { getDepthScale } from "@/game/phaser/worldDepth";

type WispState = {
  nextSwitchAt: number;
  isWalking: boolean;
  nextMeleeAt: number;
};

type NullWraithState = {
  aimAngle: number;
  chargeStartedAt: number;
  glow?: Phaser.GameObjects.Arc;
  isCharging: boolean;
  isLockedOn: boolean;
  lockedAt: number;
  nextAttackAt: number;
  wand?: Phaser.GameObjects.Graphics;
};

const WISP_MELEE_RANGE = 100;
const WISP_MELEE_COOLDOWN_MS = 1350;
const WISP_WALK_DURATION_MS = 650;
const WISP_STOP_DURATION_MS = 360;
const ENTRY_SPEED_MULTIPLIER = 1.65;
const NULL_WRAITH_AIM_LOCK_MS = 360;
const NULL_WRAITH_ATTACK_COOLDOWN_MS = 2400;
const NULL_WRAITH_CHARGE_MS = 900;
const NULL_WRAITH_MAX_ROTATION_RADIANS = 0.0012;
const NULL_WRAITH_BEAM_LENGTH = 980;
const PLAYER_MAX_HEALTH = 100;
const RANGED_ENEMY_PREFERRED_DISTANCE = 260;
const RANGED_ENEMY_DISTANCE_DEADBAND = 34;
const RANGED_ENEMY_VERTICAL_SPEED_MULTIPLIER = 0.72;

export class EnemyMovementSystem {
  private readonly wispStates = new Map<EnemyActor, WispState>();
  private readonly nullWraithStates = new Map<EnemyActor, NullWraithState>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemies: EnemyActor[],
    private readonly player: PlayerActor,
    private readonly walkableArea: ArenaRect,
  ) {}

  update(time: number, deltaMs: number) {
    for (const enemy of this.enemies) {
      if (enemy.isDefeated()) {
        this.cleanupEnemyState(enemy);
        continue;
      }

      if (this.updateEntryMovement(enemy, deltaMs)) {
        continue;
      }

      if (enemy.definition.id === "spacing-wisp") {
        this.updateSpacingWisp(enemy, time, deltaMs);
        continue;
      }

      if (isNullWraith(enemy.definition.id) && enemy.isMiniBoss) {
        this.updateNullWraith(enemy, time, deltaMs);
        continue;
      }

      this.updateRangedEnemy(enemy, deltaMs);
    }
  }

  private updateEntryMovement(enemy: EnemyActor, deltaMs: number) {
    const entryTargetX = enemy.container.getData("entryTargetX") as
      | number
      | undefined;

    if (entryTargetX === undefined) {
      return false;
    }

    if (enemy.container.x <= entryTargetX) {
      enemy.container.setData("entryTargetX", undefined);
      return false;
    }

    const step =
      enemy.definition.speed *
      ENTRY_SPEED_MULTIPLIER *
      Math.min(deltaMs, 50) *
      0.001;
    enemy.container.x = Math.max(entryTargetX, enemy.container.x - step);
    enemy.container.setDepth(enemy.container.y);
    enemy.setDepthScale(getDepthScale(enemy.container.y, this.walkableArea));

    return true;
  }

  private updateRangedEnemy(enemy: EnemyActor, deltaMs: number) {
    const frameMs = Math.min(deltaMs, 50);
    const targetX = Phaser.Math.Clamp(
      this.player.container.x + RANGED_ENEMY_PREFERRED_DISTANCE,
      this.walkableArea.x + 80,
      this.walkableArea.x + this.walkableArea.width - 44,
    );
    const dx = targetX - enemy.container.x;
    const maxHorizontalStep = enemy.definition.speed * frameMs * 0.001;

    if (Math.abs(dx) > RANGED_ENEMY_DISTANCE_DEADBAND) {
      enemy.container.x += Phaser.Math.Clamp(
        dx,
        -maxHorizontalStep,
        maxHorizontalStep,
      );
    }

    const targetY = Phaser.Math.Clamp(
      this.player.container.y,
      this.walkableArea.y + 12,
      this.walkableArea.y + this.walkableArea.height - 12,
    );
    const dy = targetY - enemy.container.y;
    const maxVerticalStep =
      enemy.definition.speed *
      RANGED_ENEMY_VERTICAL_SPEED_MULTIPLIER *
      frameMs *
      0.001;

    enemy.container.y = Phaser.Math.Clamp(
      enemy.container.y +
        Phaser.Math.Clamp(dy, -maxVerticalStep, maxVerticalStep),
      this.walkableArea.y,
      this.walkableArea.y + this.walkableArea.height,
    );
    enemy.container.setDepth(enemy.container.y);
    enemy.setDepthScale(getDepthScale(enemy.container.y, this.walkableArea));
  }

  private updateSpacingWisp(enemy: EnemyActor, time: number, deltaMs: number) {
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

  private updateNullWraith(enemy: EnemyActor, time: number, deltaMs: number) {
    const state = this.getNullWraithState(enemy, time);
    const dx = this.player.container.x - enemy.container.x;
    const dy = this.player.container.y - (enemy.container.y - 54);
    const distance = Math.hypot(dx, dy);
    const targetAngle = Phaser.Math.Angle.Between(
      enemy.container.x,
      enemy.container.y - 54,
      this.player.container.x,
      this.player.container.y - 22,
    );

    if (!state.isLockedOn) {
      state.aimAngle = Phaser.Math.Angle.RotateTo(
        state.aimAngle,
        targetAngle,
        NULL_WRAITH_MAX_ROTATION_RADIANS * Math.min(deltaMs, 50),
      );
    }

    if (!state.isCharging && distance > 260) {
      const step = enemy.definition.speed * 0.42 * Math.min(deltaMs, 50) * 0.001;
      enemy.container.x += (dx / Math.max(1, distance)) * step;
      enemy.container.y = Phaser.Math.Clamp(
        enemy.container.y + (dy / Math.max(1, distance)) * step * 0.45,
        this.walkableArea.y,
        this.walkableArea.y + this.walkableArea.height,
      );
    }

    enemy.container.setDepth(enemy.container.y);
    enemy.setDepthScale(getDepthScale(enemy.container.y, this.walkableArea));
    this.drawNullPointer(enemy, state);

    if (!state.isCharging && time >= state.nextAttackAt) {
      state.isCharging = true;
      state.chargeStartedAt = time;
      state.isLockedOn = false;
      state.lockedAt = 0;
      this.startNullPointerCharge(enemy, state);
    }

    if (!state.isCharging) {
      return;
    }

    const chargeProgress = Phaser.Math.Clamp(
      (time - state.chargeStartedAt) / NULL_WRAITH_CHARGE_MS,
      0,
      1,
    );
    this.updateNullPointerCharge(enemy, state, chargeProgress);

    if (chargeProgress >= 1 && !state.isLockedOn) {
      state.isLockedOn = true;
      state.lockedAt = time;
      return;
    }

    if (state.isLockedOn && time - state.lockedAt >= NULL_WRAITH_AIM_LOCK_MS) {
      this.fireNullBeam(enemy, state);
      state.isCharging = false;
      state.isLockedOn = false;
      state.nextAttackAt = time + NULL_WRAITH_ATTACK_COOLDOWN_MS;
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

  private getNullWraithState(enemy: EnemyActor, time: number) {
    const existing = this.nullWraithStates.get(enemy);

    if (existing) {
      return existing;
    }

    const state: NullWraithState = {
      aimAngle: Phaser.Math.Angle.Between(
        enemy.container.x,
        enemy.container.y,
        this.player.container.x,
        this.player.container.y,
      ),
      nextAttackAt: time + 1200,
      isCharging: false,
      chargeStartedAt: 0,
      isLockedOn: false,
      lockedAt: 0,
    };
    this.nullWraithStates.set(enemy, state);

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
      this.dispatchPlayerHit(enemy.getDamage());
    }
  }

  private drawNullPointer(enemy: EnemyActor, state: NullWraithState) {
    const start = this.getNullPointerOrigin(enemy);
    const wandLength = 58 * Math.abs(enemy.container.scaleX);
    const endX = start.x + Math.cos(state.aimAngle) * wandLength;
    const endY = start.y + Math.sin(state.aimAngle) * wandLength;

    if (!state.wand) {
      state.wand = this.scene.add.graphics();
    }

    state.wand.clear();
    state.wand.lineStyle(6, 0x220617, 0.78);
    state.wand.lineBetween(start.x, start.y, endX, endY);
    state.wand.lineStyle(2, 0xfca5a5, 0.9);
    state.wand.lineBetween(start.x, start.y, endX, endY);
    state.wand.setDepth(enemy.container.y + 34);
  }

  private startNullPointerCharge(enemy: EnemyActor, state: NullWraithState) {
    const start = this.getNullPointerTip(enemy, state);
    state.glow?.destroy();
    state.glow = this.scene.add
      .circle(start.x, start.y, 10, 0xef4444, 0.34)
      .setStrokeStyle(2, 0xfca5a5, 0.8)
      .setDepth(enemy.container.y + 38);
  }

  private updateNullPointerCharge(
    enemy: EnemyActor,
    state: NullWraithState,
    progress: number,
  ) {
    if (!state.glow) {
      return;
    }

    const tip = this.getNullPointerTip(enemy, state);
    state.glow.x = tip.x;
    state.glow.y = tip.y;
    state.glow.setRadius(10 + progress * 22);
    state.glow.setFillStyle(0xef4444, 0.24 + progress * 0.42);
    state.glow.setDepth(enemy.container.y + 38);
  }

  private fireNullBeam(enemy: EnemyActor, state: NullWraithState) {
    const start = this.getNullPointerTip(enemy, state);
    const end = {
      x: start.x + Math.cos(state.aimAngle) * NULL_WRAITH_BEAM_LENGTH,
      y: start.y + Math.sin(state.aimAngle) * NULL_WRAITH_BEAM_LENGTH,
    };
    const beamLine = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);
    const beam = this.scene.add.graphics().setDepth(enemy.container.y + 42);

    beam.lineStyle(16, 0x7f1d1d, 0.42);
    beam.lineBetween(start.x, start.y, end.x, end.y);
    beam.lineStyle(5, 0xfca5a5, 0.95);
    beam.lineBetween(start.x, start.y, end.x, end.y);

    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 260,
      onComplete: () => beam.destroy(),
    });

    state.glow?.destroy();
    state.glow = undefined;

    if (
      Phaser.Geom.Intersects.LineToRectangle(
        beamLine,
        this.player.container.getBounds(),
      )
    ) {
      this.dispatchPlayerHit(enemy.getDamage());
    }
  }

  private getNullPointerOrigin(enemy: EnemyActor) {
    return {
      x: enemy.container.x - 12 * Math.abs(enemy.container.scaleX),
      y: enemy.container.y - 58 * Math.abs(enemy.container.scaleY),
    };
  }

  private getNullPointerTip(enemy: EnemyActor, state: NullWraithState) {
    const start = this.getNullPointerOrigin(enemy);
    const wandLength = 58 * Math.abs(enemy.container.scaleX);

    return {
      x: start.x + Math.cos(state.aimAngle) * wandLength,
      y: start.y + Math.sin(state.aimAngle) * wandLength,
    };
  }

  private dispatchPlayerHit(damage: number) {
    playHitShake(
      this.scene,
      getPlayerDamageShakeIntensity(damage, PLAYER_MAX_HEALTH),
    );
    window.dispatchEvent(
      new CustomEvent("codebound:enemy-projectile-hit", {
        detail: { damage },
      }),
    );
  }

  private cleanupEnemyState(enemy: EnemyActor) {
    const nullWraithState = this.nullWraithStates.get(enemy);

    if (nullWraithState) {
      nullWraithState.glow?.destroy();
      nullWraithState.wand?.destroy();
      this.nullWraithStates.delete(enemy);
    }

    this.wispStates.delete(enemy);
  }
}

function getPlayerDamageShakeIntensity(
  damage: number,
  maxHealth: number,
): ScreenShakeIntensity {
  const damagePercent = damage / maxHealth;

  if (damagePercent >= 0.5) {
    return "heavy";
  }

  if (damagePercent > 0.1) {
    return "normal";
  }

  return "light";
}

function isNullWraith(enemyId: string) {
  return enemyId === "null-wraith" || enemyId === "null-wraith-miniboss";
}
