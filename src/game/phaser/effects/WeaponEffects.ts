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
      .graphics({ x: startX, y })
      .setDepth(from.y + 24)
      .setScale(direction, 1);

    arrow.fillStyle(0x67e8f9, 0.24);
    arrow.fillRect(-42, -2, 18, 4);
    arrow.fillStyle(0xe0f2fe, 0.98);
    arrow.lineStyle(1, 0xffffff, 0.5);
    arrow.beginPath();
    arrow.moveTo(-30, -6);
    arrow.lineTo(8, -6);
    arrow.lineTo(8, -12);
    arrow.lineTo(34, 0);
    arrow.lineTo(8, 12);
    arrow.lineTo(8, 6);
    arrow.lineTo(-30, 6);
    arrow.lineTo(-22, 0);
    arrow.closePath();
    arrow.fillPath();
    arrow.strokePath();

    scene.tweens.add({
      targets: arrow,
      x: `+=${direction * rangePixels}`,
      alpha: 0,
      duration: (rangePixels / 980) * 1000,
      ease: "Linear",
      onComplete: () => arrow.destroy(),
    });
  }
}
