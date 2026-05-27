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
}
