import * as Phaser from "phaser";

import { PLAYER_MOVEMENT_TUNING } from "@/game/config/player";
import type { ArenaRect } from "@/game/domain/types";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";

type MovementKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
};

export class PlayerMovementSystem {
  private readonly keys?: MovementKeys;

  constructor(
    scene: Phaser.Scene,
    private readonly player: PlayerActor,
    private readonly walkableArea: ArenaRect,
  ) {
    this.keys = scene.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
    }) as MovementKeys | undefined;
  }

  update(deltaMs: number) {
    if (!this.keys) {
      return;
    }

    const x =
      (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0) -
      (this.keys.left.isDown || this.keys.a.isDown ? 1 : 0);
    const y =
      (this.keys.down.isDown || this.keys.s.isDown ? 1 : 0) -
      (this.keys.up.isDown || this.keys.w.isDown ? 1 : 0);
    const length = Math.hypot(x, y);

    if (length === 0) {
      return;
    }

    const distance =
      PLAYER_MOVEMENT_TUNING.speedPxPerSecond * Math.min(deltaMs, 50) * 0.001;
    const nextX = Phaser.Math.Clamp(
      this.player.container.x + (x / length) * distance,
      this.walkableArea.x,
      this.walkableArea.x + this.walkableArea.width,
    );
    const nextY = Phaser.Math.Clamp(
      this.player.container.y + (y / length) * distance,
      this.walkableArea.y,
      this.walkableArea.y + this.walkableArea.height,
    );

    this.player.setPosition(nextX, nextY);

    if (x !== 0) {
      this.player.setFacing(x > 0 ? 1 : -1);
    }
  }
}
