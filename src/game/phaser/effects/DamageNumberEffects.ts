import * as Phaser from "phaser";

export class DamageNumberEffects {
  static show(scene: Phaser.Scene, x: number, y: number, damage: number) {
    const label = scene.add
      .text(x, y, `-${damage}`, {
        color: "#fecaca",
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    scene.tweens.add({
      targets: label,
      alpha: 0,
      y: y - 28,
      duration: 520,
      onComplete: () => label.destroy(),
    });
  }
}
