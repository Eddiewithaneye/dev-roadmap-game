import * as Phaser from "phaser";

import type { PlayerActor } from "./PlayerActor";

export class CodeFragmentPickup {
  readonly container: Phaser.GameObjects.Container;
  private readonly icon: Phaser.GameObjects.Container;
  private isCollectible = false;
  private isCollected = false;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly amount: number,
    private readonly visualScale = 0.78,
  ) {
    const glow = scene.add.circle(0, 0, 20, 0xfacc15, 0.18);
    this.icon = createFileIcon(scene);
    const label = scene.add
      .text(0, 26, `+${amount}`, {
        color: "#fde68a",
        fontFamily: "monospace",
        fontSize: "12px",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.container = scene.add.container(x, y - 54 * visualScale, [
      glow,
      this.icon,
      label,
    ]);
    this.container.setName("code-fragment-pickup");
    this.container.setDepth(y + 4);
    this.container.setScale(visualScale);

    scene.tweens.add({
      targets: this.container,
      y,
      duration: 360,
      ease: "Bounce.easeOut",
      onComplete: () => {
        this.isCollectible = true;
      },
    });

    scene.tweens.add({
      targets: this.icon,
      scaleX: -this.icon.scaleX,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    scene.tweens.add({
      targets: glow,
      alpha: 0.38,
      scale: 1.25,
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  update(player: PlayerActor) {
    if (
      this.isCollected ||
      !this.isCollectible ||
      !Phaser.Geom.Intersects.RectangleToRectangle(
        this.container.getBounds(),
        player.container.getBounds(),
      )
    ) {
      return false;
    }

    this.isCollected = true;
    window.dispatchEvent(
      new CustomEvent("codebound:code-fragment-collected", {
        detail: { amount: this.amount },
      }),
    );

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: this.container.y - 24 * this.visualScale,
      scale: this.visualScale * 0.7,
      duration: 180,
      onComplete: () => this.container.destroy(),
    });

    return true;
  }

  destroy() {
    this.container.destroy();
  }
}

function createFileIcon(scene: Phaser.Scene) {
  const paper = scene.add.graphics();
  const fold = scene.add.graphics();
  const code = scene.add.text(0, 2, "</>", {
    color: "#78350f",
    fontFamily: "monospace",
    fontSize: "10px",
    fontStyle: "700",
  });

  paper.fillStyle(0xfef3c7, 1);
  paper.lineStyle(2, 0xfacc15, 1);
  paper.beginPath();
  paper.moveTo(-13, -18);
  paper.lineTo(5, -18);
  paper.lineTo(13, -10);
  paper.lineTo(13, 18);
  paper.lineTo(-13, 18);
  paper.closePath();
  paper.fillPath();
  paper.strokePath();

  fold.fillStyle(0xfde68a, 1);
  fold.lineStyle(1, 0xf59e0b, 1);
  fold.beginPath();
  fold.moveTo(5, -18);
  fold.lineTo(13, -10);
  fold.lineTo(5, -10);
  fold.closePath();
  fold.fillPath();
  fold.strokePath();

  code.setOrigin(0.5);

  return scene.add.container(0, -4, [paper, fold, code]);
}
