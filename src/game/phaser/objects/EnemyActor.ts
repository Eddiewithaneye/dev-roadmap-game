import * as Phaser from "phaser";

import type { EnemyDefinition } from "@/game/config/enemies";

export class EnemyActor {
  readonly container: Phaser.GameObjects.Container;
  readonly definition: EnemyDefinition;
  private depthScale = 1;
  private health: number;
  private defeated = false;

  constructor(scene: Phaser.Scene, enemy: EnemyDefinition, x: number, y: number) {
    this.definition = enemy;
    this.health = enemy.health;

    const style = getEnemyStyle(enemy.id);
    const shadow = scene.add.ellipse(0, 8, style.shadowWidth, 14, 0x000000, 0.36);
    const body =
      enemy.id === "syntax-wisp"
        ? scene.add.ellipse(0, -42, 62, 76, style.bodyColor)
        : scene.add.rectangle(0, -42, 76, 84, style.bodyColor);
    const core =
      enemy.id === "syntax-wisp"
        ? scene.add.ellipse(0, -42, 32, 38, style.coreColor)
        : scene.add.rectangle(0, -42, 42, 44, style.coreColor);
    const label = scene.add
      .text(0, 22, enemy.name, {
        color: style.textColor,
        fontFamily: "monospace",
        fontSize: "14px",
      })
      .setOrigin(0.5);

    body.setStrokeStyle(4, style.strokeColor);
    core.setStrokeStyle(2, style.coreStrokeColor);

    this.container = scene.add.container(x, y, [shadow, body, core, label]);
    this.container.setName(enemy.id);
    this.container.setSize(76, 106);
    this.container.setDepth(y);
  }

  setDepthScale(scale: number) {
    this.depthScale = scale;
    this.container.setScale(this.depthScale);
  }

  applyDamage(scene: Phaser.Scene, damage: number) {
    if (this.defeated) {
      return false;
    }

    this.health = Math.max(0, this.health - damage);

    if (this.health > 0) {
      return true;
    }

    this.defeated = true;
    scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: this.container.scaleX * 0.75,
      scaleY: this.container.scaleY * 0.75,
      duration: 260,
      onComplete: () => this.container.destroy(),
    });

    return true;
  }

  isDefeated() {
    return this.defeated;
  }
}

function getEnemyStyle(enemyId: string) {
  if (enemyId === "syntax-wisp") {
    return {
      bodyColor: 0x7dd3fc,
      coreColor: 0x0e7490,
      strokeColor: 0xecfeff,
      coreStrokeColor: 0x67e8f9,
      textColor: "#ecfeff",
      shadowWidth: 54,
    };
  }

  return {
    bodyColor: 0xf97316,
    coreColor: 0x7c2d12,
    strokeColor: 0xffedd5,
    coreStrokeColor: 0xfed7aa,
    textColor: "#ffedd5",
    shadowWidth: 72,
  };
}
