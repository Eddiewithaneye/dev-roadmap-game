import * as Phaser from "phaser";

type PositionLike = {
  x: number;
  y: number;
};

export class WeaponEffects {
  static spark(scene: Phaser.Scene, from: PositionLike, to: PositionLike) {
    const bolt = scene.add
      .line(0, 0, from.x, from.y - 72, to.x, to.y - 48, 0x67e8f9, 0.9)
      .setOrigin(0);

    scene.tweens.add({
      targets: bolt,
      alpha: 0,
      duration: 180,
      onComplete: () => bolt.destroy(),
    });
  }

  static straightShot(
    scene: Phaser.Scene,
    from: PositionLike,
    direction: -1 | 1,
    rangePixels: number,
  ) {
    const startX = from.x + direction * 34;
    const y = from.y - 56;
    const arrow = scene.add
      .rectangle(startX, y, 34, 6, 0xf8fafc, 0.95)
      .setDepth(from.y + 24);
    const tip = scene.add
      .triangle(
        startX + direction * 22,
        y,
        direction === 1 ? 12 : -12,
        -8,
        direction === 1 ? 12 : -12,
        8,
        direction === 1 ? 28 : -28,
        0,
        0x38bdf8,
        0.95,
      )
      .setDepth(from.y + 25);

    scene.tweens.add({
      targets: [arrow, tip],
      x: `+=${direction * rangePixels}`,
      alpha: 0,
      duration: 420,
      ease: "Sine.easeOut",
      onComplete: () => {
        arrow.destroy();
        tip.destroy();
      },
    });
  }
}
