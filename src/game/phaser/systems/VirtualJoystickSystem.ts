import * as Phaser from "phaser";
import VirtualJoystick from "phaser4-rex-plugins/plugins/virtualjoystick.js";

import type {
  MovementInputSource,
  MovementVector,
} from "@/game/phaser/systems/PlayerMovementSystem";

const JOYSTICK_RADIUS = 76;
const JOYSTICK_MAX_FORCE = 86;
const LEFT_TOUCH_ZONE_WIDTH_RATIO = 0.58;

type RexVirtualJoystick = InstanceType<typeof VirtualJoystick> & {
  touchCursor?: {
    onKeyDownStart?: (pointer: Phaser.Input.Pointer) => void;
  };
};

export class VirtualJoystickSystem implements MovementInputSource {
  private readonly joystick: RexVirtualJoystick;
  private readonly captureZone: Phaser.GameObjects.Zone;
  private isEnabled = false;

  constructor(private readonly scene: Phaser.Scene) {
    const base = scene.add
      .circle(0, 0, JOYSTICK_RADIUS, 0x22d3ee, 0.12)
      .setStrokeStyle(3, 0x67e8f9, 0.34)
      .setDepth(10_000)
      .setScrollFactor(0);
    const thumb = scene.add
      .circle(0, 0, 28, 0xd380ec, 0.28)
      .setStrokeStyle(3, 0xf4d7ff, 0.56)
      .setDepth(10_001)
      .setScrollFactor(0);

    this.joystick = new VirtualJoystick(scene, {
      x: -1000,
      y: -1000,
      radius: JOYSTICK_RADIUS,
      base,
      thumb,
      dir: "8dir",
      forceMin: 8,
      fixed: true,
    }) as RexVirtualJoystick;
    this.joystick.setVisible(false);

    this.captureZone = scene.add
      .zone(0, 0, 1, 1)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(9_999)
      .setInteractive();

    this.resizeCaptureZone();
    this.captureZone.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => this.beginJoystickDrag(pointer),
    );
    scene.input.on("pointerup", this.hideJoystick, this);
    scene.scale.on("resize", this.resizeCaptureZone, this);
  }

  setEnabled(isEnabled: boolean) {
    this.isEnabled = isEnabled;
    this.captureZone.setVisible(isEnabled);
    this.captureZone.disableInteractive();

    if (isEnabled) {
      this.captureZone.setInteractive();
    } else {
      this.hideJoystick();
    }
  }

  getMovementVector(): MovementVector {
    if (!this.isEnabled || !this.joystick.visible) {
      return { x: 0, y: 0 };
    }

    const forceX = Phaser.Math.Clamp(
      this.joystick.forceX / JOYSTICK_MAX_FORCE,
      -1,
      1,
    );
    const forceY = Phaser.Math.Clamp(
      this.joystick.forceY / JOYSTICK_MAX_FORCE,
      -1,
      1,
    );

    return { x: forceX, y: forceY };
  }

  destroy() {
    this.scene.scale.off("resize", this.resizeCaptureZone, this);
    this.scene.input.off("pointerup", this.hideJoystick, this);
    this.captureZone.destroy();
    this.joystick.destroy();
  }

  private beginJoystickDrag(pointer: Phaser.Input.Pointer) {
    if (!this.isEnabled) {
      return;
    }

    this.joystick.setPosition(pointer.x, pointer.y);
    this.joystick.setVisible(true);
    this.joystick.setEnable(true);
    this.joystick.touchCursor?.onKeyDownStart?.(pointer);
  }

  private hideJoystick() {
    this.joystick.setVisible(false);
  }

  private resizeCaptureZone() {
    this.captureZone.setPosition(0, 0);
    this.captureZone.setSize(
      this.scene.scale.width * LEFT_TOUCH_ZONE_WIDTH_RATIO,
      this.scene.scale.height,
    );
    this.captureZone.input?.hitArea?.setTo?.(
      0,
      0,
      this.scene.scale.width * LEFT_TOUCH_ZONE_WIDTH_RATIO,
      this.scene.scale.height,
    );
  }
}
