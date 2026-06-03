import * as Phaser from "phaser";

import type { ArenaRect } from "@/game/domain/types";
import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { getDepthScale, getWorldZ } from "@/game/phaser/worldDepth";

type EnemyProjectile = {
  body: Phaser.GameObjects.Arc;
  shadow: Phaser.GameObjects.Ellipse;
  x: number;
  laneY: number;
  altitude: number;
  vx: number;
  laneVy: number;
  altitudeVelocity: number;
  bouncesRemaining: number;
  hasHitPlayer: boolean;
};

const FIRE_INTERVAL_MS = 1900;
const FIRST_SHOT_DELAY_MS = 850;
const GRAVITY = 980;
const FLOOR_DAMPING = 0.52;
const ROLL_FRICTION = 0.76;
const MIN_BOUNCE_SPEED = 115;
const ROCK_RADIUS = 8;
const PLAYER_HIT_DAMAGE = 12;
const ATTACK_WIDTH = 64;
const SHADOW_BASE_WIDTH = 34;
const SHADOW_BASE_HEIGHT = ATTACK_WIDTH;

export class EnemyProjectileSystem {
  private nextFireAt = FIRST_SHOT_DELAY_MS;
  private readonly projectiles: EnemyProjectile[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemies: EnemyActor[],
    private readonly player: PlayerActor,
    private readonly walkableArea: ArenaRect,
  ) {
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.destroyProjectiles();
    });
  }

  update(time: number, deltaMs: number) {
    const throwingEnemies = this.enemies.filter(
      (enemy) => enemy.definition.id === "data-colossus" && !enemy.isDefeated(),
    );

    if (throwingEnemies.length > 0 && time >= this.nextFireAt) {
      this.fire(Phaser.Utils.Array.GetRandom(throwingEnemies));
      this.nextFireAt = time + FIRE_INTERVAL_MS + randomBetween(-240, 360);
    }

    this.updateProjectiles(deltaMs / 1000);
  }

  private fire(enemy: EnemyActor) {
    const direction = this.player.container.x < enemy.container.x ? -1 : 1;
    const startX = enemy.container.x + direction * 44;
    const laneY = enemy.container.y;
    const startAltitude = 44;
    const horizontalForce = randomBetween(280, 430);
    const spread = randomBetween(-42, 42);
    const lobForce = randomBetween(320, 420);
    const body = this.scene.add
      .circle(startX, laneY - startAltitude, ROCK_RADIUS, 0x6b7280)
      .setStrokeStyle(2, 0xd1d5db, 0.85)
      .setDepth(12);
    const shadow = this.scene.add
      .ellipse(
        startX,
        laneY + 2,
        SHADOW_BASE_WIDTH,
        SHADOW_BASE_HEIGHT,
        0x000000,
        0.2,
      )
      .setDepth(1);

    this.projectiles.push({
      body,
      shadow,
      x: startX,
      laneY,
      altitude: startAltitude,
      vx: direction * horizontalForce,
      laneVy: spread,
      altitudeVelocity: lobForce,
      bouncesRemaining: Phaser.Math.Between(2, 3),
      hasHitPlayer: false,
    });
  }

  private updateProjectiles(deltaSeconds: number) {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index];

      projectile.altitudeVelocity -= GRAVITY * deltaSeconds;
      projectile.x += projectile.vx * deltaSeconds;
      projectile.laneY = Phaser.Math.Clamp(
        projectile.laneY + projectile.laneVy * deltaSeconds,
        this.walkableArea.y,
        this.walkableArea.y + this.walkableArea.height,
      );
      projectile.altitude += projectile.altitudeVelocity * deltaSeconds;
      projectile.body.x = projectile.x;
      projectile.body.y = projectile.laneY - projectile.altitude;
      projectile.body.rotation += projectile.vx * deltaSeconds * 0.045;

      const depthScale = getDepthScale(projectile.laneY, this.walkableArea);
      projectile.body.setScale(depthScale);
      projectile.body.setDepth(projectile.laneY + 8);
      projectile.shadow.setDepth(projectile.laneY - 1);
      projectile.shadow.y = projectile.laneY + 2;
      projectile.shadow.x = projectile.x;
      projectile.shadow.scaleX = Phaser.Math.Clamp(
        depthScale * (1 - projectile.altitude / 260),
        0.25,
        depthScale,
      );
      projectile.shadow.scaleY = depthScale * 0.42;
      projectile.shadow.alpha = Phaser.Math.Clamp(
        0.34 - projectile.altitude / 900,
        0.1,
        0.38,
      );

      if (projectile.altitude <= 0) {
        this.bounce(projectile);
      }

      if (this.didHitPlayer(projectile)) {
        this.dispatchPlayerHit(projectile);
      }

      projectile.body.y = projectile.laneY - projectile.altitude;
      projectile.body.setData(
        "worldZ",
        getWorldZ(projectile.laneY, this.walkableArea),
      );

      if (this.shouldDestroy(projectile)) {
        projectile.body.destroy();
        projectile.shadow.destroy();
        this.projectiles.splice(index, 1);
      }
    }
  }

  private bounce(projectile: EnemyProjectile) {
    projectile.altitude = 0;
    projectile.vx *= ROLL_FRICTION;
    projectile.laneVy *= ROLL_FRICTION;

    if (
      projectile.bouncesRemaining <= 0 ||
      Math.abs(projectile.altitudeVelocity) < MIN_BOUNCE_SPEED
    ) {
      projectile.altitudeVelocity = 0;
      return;
    }

    projectile.altitudeVelocity =
      Math.abs(projectile.altitudeVelocity) * FLOOR_DAMPING;
    projectile.bouncesRemaining -= 1;

    this.scene.tweens.add({
      targets: projectile.shadow,
      scaleX: 1.25,
      scaleY: 1.18,
      yoyo: true,
      duration: 80,
    });
  }

  private shouldDestroy(projectile: EnemyProjectile) {
    const { width } = this.scene.scale;
    const hasHitPlayer = projectile.hasHitPlayer;
    const hasSettled =
      projectile.altitude <= 0 &&
      projectile.altitudeVelocity === 0 &&
      Math.abs(projectile.vx) < 75;
    const isOutOfBounds =
      projectile.body.x < -48 || projectile.body.x > width + 48;

    return hasHitPlayer || hasSettled || isOutOfBounds;
  }

  private didHitPlayer(projectile: EnemyProjectile) {
    if (projectile.hasHitPlayer) {
      return false;
    }

    const playerBounds = this.player.container.getBounds();
    const horizontalOverlap =
      projectile.x + ROCK_RADIUS >= playerBounds.left &&
      projectile.x - ROCK_RADIUS <= playerBounds.right;
    const pathOverlap =
      Math.abs(projectile.laneY - this.player.container.y) <= ATTACK_WIDTH / 2;
    const altitudeOverlap =
      projectile.altitude <= Math.max(24, playerBounds.height * 0.82);

    return horizontalOverlap && pathOverlap && altitudeOverlap;
  }

  private dispatchPlayerHit(projectile: EnemyProjectile) {
    projectile.hasHitPlayer = true;
    projectile.body.setFillStyle(0xfca5a5, 1);

    window.dispatchEvent(
      new CustomEvent("codebound:enemy-projectile-hit", {
        detail: { damage: PLAYER_HIT_DAMAGE },
      }),
    );
  }

  private destroyProjectiles() {
    this.projectiles.forEach((projectile) => {
      projectile.body.destroy();
      projectile.shadow.destroy();
    });
    this.projectiles.length = 0;
  }
}

function randomBetween(min: number, max: number) {
  return Phaser.Math.FloatBetween(min, max);
}
