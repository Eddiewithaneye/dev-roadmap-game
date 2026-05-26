import * as Phaser from "phaser";

export class HitFeedbackEffects {
  static flash(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject) {
    scene.tweens.add({
      targets: target,
      alpha: 0.35,
      duration: 80,
      yoyo: true,
    });
  }
}
