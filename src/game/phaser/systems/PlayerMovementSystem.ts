import * as Phaser from "phaser";

import { useGameStore } from "@/components/game/stores/useGameStore";
import { PLAYER_MOVEMENT_TUNING } from "@/game/config/player";
import type { ArenaRect } from "@/game/domain/types";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import {
  getDepthScale,
  getMovementSpeedScale,
  type DepthScaleProfile,
} from "@/game/phaser/worldDepth";

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

export type MovementVector = {
  x: number;
  y: number;
};

export type MovementInputSource = {
  getMovementVector: () => MovementVector;
};

class KeyboardMovementInput implements MovementInputSource {
  constructor(private readonly keys?: MovementKeys) {}

  getMovementVector() {
    if (!this.keys) {
      return { x: 0, y: 0 };
    }

    return {
      x:
        (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0) -
        (this.keys.left.isDown || this.keys.a.isDown ? 1 : 0),
      y:
        (this.keys.down.isDown || this.keys.s.isDown ? 1 : 0) -
        (this.keys.up.isDown || this.keys.w.isDown ? 1 : 0),
    };
  }
}

export class PlayerMovementSystem {
  private readonly inputSources: MovementInputSource[];
  private lastPublishedSpeed = -1;

  constructor(
    scene: Phaser.Scene,
    private readonly player: PlayerActor,
    private readonly walkableArea: ArenaRect,
    private readonly gameplayScale = 1,
    private readonly depthScaleProfile?: DepthScaleProfile,
  ) {
    const keys = scene.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
    }) as MovementKeys | undefined;
    this.inputSources = [new KeyboardMovementInput(keys)];
  }

  addInputSource(inputSource: MovementInputSource) {
    this.inputSources.push(inputSource);
  }

  update(deltaMs: number) {
    const { x, y } = this.getMovementVector();
    const length = Math.hypot(x, y);

    if (length === 0) {
      this.publishMovementSpeed(0);
      return;
    }

    const speedScale = getMovementSpeedScale(
      this.player.container.y,
      this.walkableArea,
    );
    const movementSpeedMultiplier =
      useGameStore.getState().movementSpeedMultiplier;
    const currentMovementSpeed =
      PLAYER_MOVEMENT_TUNING.speedPxPerSecond *
      this.gameplayScale *
      speedScale *
      movementSpeedMultiplier;
    const distance = currentMovementSpeed * Math.min(deltaMs, 50) * 0.001;
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

    this.publishMovementSpeed(currentMovementSpeed);
    this.player.setPosition(nextX, nextY);
    this.player.setDepthScale(
      getDepthScale(nextY, this.walkableArea, this.depthScaleProfile),
    );

    if (x !== 0) {
      this.player.setFacing(x > 0 ? 1 : -1);
    }
  }

  private getMovementVector() {
    const combinedVector = this.inputSources.reduce(
      (vector, inputSource) => {
        const inputVector = inputSource.getMovementVector();

        return {
          x: vector.x + inputVector.x,
          y: vector.y + inputVector.y,
        };
      },
      { x: 0, y: 0 },
    );
    const length = Math.hypot(combinedVector.x, combinedVector.y);

    if (length <= 1) {
      return combinedVector;
    }

    return {
      x: combinedVector.x / length,
      y: combinedVector.y / length,
    };
  }

  private publishMovementSpeed(speed: number) {
    const roundedSpeed = Math.round(speed);

    if (roundedSpeed === this.lastPublishedSpeed) {
      return;
    }

    this.lastPublishedSpeed = roundedSpeed;
    useGameStore.getState().setCurrentMovementSpeed(roundedSpeed);
  }
}
