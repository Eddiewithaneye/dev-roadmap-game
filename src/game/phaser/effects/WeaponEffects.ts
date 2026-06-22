import * as Phaser from "phaser";

type PositionLike = {
  x: number;
  y: number;
};

type StraightShotOptions = {
  debugHitbox?: Phaser.Geom.Rectangle;
  showDebug?: boolean;
};

const DEBUG_HITBOX_COLOR = 0xff8a00;

export class WeaponEffects {
  static spark(scene: Phaser.Scene, from: PositionLike, to: PositionLike) {
    const target = {
      x: to.x,
      y: to.y - 48,
    };
    const bolt = scene.add.graphics().setDepth(Math.max(from.y, target.y) + 24);
    const flare = scene.add
      .graphics({ x: from.x, y: from.y })
      .setDepth(from.y + 48);

    flare.fillStyle(0x67e8f9, 0.4);
    flare.fillCircle(0, 0, 22);
    flare.fillStyle(0xe0f2fe, 0.95);
    flare.fillCircle(0, 0, 7);
    flare.lineStyle(2, 0xffffff, 0.75);
    flare.strokeCircle(0, 0, 12);

    bolt.lineStyle(7, 0x0e7490, 0.42);
    bolt.strokeLineShape(
      new Phaser.Geom.Line(from.x, from.y, target.x, target.y),
    );
    bolt.lineStyle(3, 0x67e8f9, 1);
    bolt.strokeLineShape(
      new Phaser.Geom.Line(from.x, from.y, target.x, target.y),
    );
    bolt.lineStyle(1, 0xffffff, 0.9);
    bolt.strokeLineShape(
      new Phaser.Geom.Line(from.x, from.y, target.x, target.y),
    );

    scene.tweens.add({
      targets: flare,
      alpha: 0,
      scaleX: 1.55,
      scaleY: 1.55,
      duration: 140,
      ease: "Quad.easeOut",
      onComplete: () => flare.destroy(),
    });

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
    options: StraightShotOptions = {},
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

    if (options.showDebug && options.debugHitbox) {
      this.debugRect(scene, options.debugHitbox);
    }

    scene.tweens.add({
      targets: arrow,
      x: `+=${direction * rangePixels}`,
      alpha: 0,
      duration: (rangePixels / 980) * 1000,
      ease: "Linear",
      onComplete: () => arrow.destroy(),
    });
  }

  static debugRect(
    scene: Phaser.Scene,
    rect: Phaser.Geom.Rectangle,
    duration = 420,
  ) {
    const debug = scene.add.graphics().setDepth(5000);

    debug.fillStyle(DEBUG_HITBOX_COLOR, 0.12);
    debug.fillRect(rect.x, rect.y, rect.width, rect.height);
    debug.lineStyle(2, DEBUG_HITBOX_COLOR, 0.95);
    debug.strokeRect(rect.x, rect.y, rect.width, rect.height);

    scene.tweens.add({
      targets: debug,
      alpha: 0,
      duration,
      onComplete: () => debug.destroy(),
    });
  }
}
