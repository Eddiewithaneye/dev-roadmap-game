import * as Phaser from "phaser";

import type { EnemyDefinition } from "@/game/config/enemies";

export class EnemyActor {
  readonly container: Phaser.GameObjects.Container;
  private depthScale = 1;

  constructor(scene: Phaser.Scene, enemy: EnemyDefinition, x: number, y: number) {
    const shadow = scene.add.ellipse(0, 8, 72, 14, 0x000000, 0.36);
    const body = scene.add.rectangle(0, -42, 76, 84, 0xf97316);
    const core = scene.add.rectangle(0, -42, 42, 44, 0x7c2d12);
    const label = scene.add
      .text(0, 22, enemy.name, {
        color: "#ffedd5",
        fontFamily: "monospace",
        fontSize: "14px",
      })
      .setOrigin(0.5);

    body.setStrokeStyle(4, 0xffedd5);
    core.setStrokeStyle(2, 0xfed7aa);

    this.container = scene.add.container(x, y, [shadow, body, core, label]);
    this.container.setName(enemy.id);
    this.container.setSize(76, 106);
    this.container.setDepth(y);
  }

  setDepthScale(scale: number) {
    this.depthScale = scale;
    this.container.setScale(this.depthScale);
  }
}
