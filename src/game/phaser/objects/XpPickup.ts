import * as Phaser from "phaser";

export class XpPickup {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, amount: number) {
    const glow = scene.add.circle(0, 0, 18, 0x22d3ee, 0.22);
    const core = scene.add.circle(0, 0, 8, 0xbae6fd, 0.9);
    const label = scene.add
      .text(0, 20, `+${amount} XP`, {
        color: "#bae6fd",
        fontFamily: "monospace",
        fontSize: "12px",
      })
      .setOrigin(0.5);

    this.container = scene.add.container(x, y, [glow, core, label]);
    this.container.setName("xp-pickup");
  }
}
