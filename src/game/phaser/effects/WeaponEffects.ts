import * as Phaser from "phaser";

type PositionLike = {
  x: number;
  y: number;
};

export class WeaponEffects {
  static spark(scene: Phaser.Scene, from: PositionLike, to: PositionLike) {
    const target = {
      x: to.x,
      y: to.y - 48,
    };
    const bolt = scene.add.graphics().setDepth(Math.max(from.y, target.y) + 24);

    bolt.fillStyle(0x67e8f9, 0.24);
    bolt.fillCircle(from.x, from.y, 16);
    bolt.fillStyle(0xe0f2fe, 0.78);
    bolt.fillCircle(from.x, from.y, 5);

    bolt.lineStyle(5, 0x0e7490, 0.36);
    bolt.strokeLineShape(new Phaser.Geom.Line(from.x, from.y, target.x, target.y));
    bolt.lineStyle(2, 0x67e8f9, 0.95);
    bolt.strokeLineShape(new Phaser.Geom.Line(from.x, from.y, target.x, target.y));

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
