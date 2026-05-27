import * as Phaser from "phaser";

import { PLAYER_PLACEHOLDER_TUNING } from "@/game/config/player";

export class PlayerActor {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const shadow = scene.add.ellipse(0, 6, 58, 12, 0x000000, 0.34);
    const legs = scene.add.rectangle(0, -18, 42, 34, 0x0f2f44);
    const body = scene.add.rectangle(0, -58, 58, 56, 0x0891b2);
    const laptop = scene.add.rectangle(0, -58, 34, 22, 0x101826);
    const head = scene.add.ellipse(0, -102, 44, 38, 0xf2bd91);
    const hair = scene.add.rectangle(0, -120, 48, 14, 0x171923);
    const glasses = scene.add.rectangle(0, -104, 34, 6, 0xe0f2fe);
    const wand = scene.add.rectangle(34, -78, 12, 42, 0x0d1824);

    this.container = scene.add.container(x, y, [
      shadow,
      legs,
      body,
      laptop,
      head,
      hair,
      glasses,
      wand,
    ]);
    this.container.setName("player");
    this.container.setSize(
      PLAYER_PLACEHOLDER_TUNING.widthPx,
      PLAYER_PLACEHOLDER_TUNING.heightPx,
    );
    this.container.setScale(PLAYER_PLACEHOLDER_TUNING.scale);
  }

  setPosition(x: number, y: number) {
    this.container.setPosition(x, y);
  }

  setFacing(facing: -1 | 1) {
    this.container.setScale(
      PLAYER_PLACEHOLDER_TUNING.scale * facing,
      PLAYER_PLACEHOLDER_TUNING.scale,
    );
  }
}
