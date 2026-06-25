import * as Phaser from "phaser";

import type { EnemyDefinition } from "@/game/config/enemies";

export type EnemyActorOptions = {
  isMiniBoss?: boolean;
  isPrimaryTarget?: boolean;
  scaleMultiplier?: number;
};

export class EnemyActor {
  readonly container: Phaser.GameObjects.Container;
  readonly definition: EnemyDefinition;
  readonly isMiniBoss: boolean;
  readonly isPrimaryTarget: boolean;
  private depthScale = 1;
  private health: number;
  private readonly maxHealth: number;
  private readonly scaleMultiplier: number;
  private readonly healthBar: Phaser.GameObjects.Graphics;
  private defeated = false;

  constructor(
    scene: Phaser.Scene,
    enemy: EnemyDefinition,
    x: number,
    y: number,
    options: EnemyActorOptions = {},
  ) {
    this.definition = enemy;
    this.isMiniBoss = options.isMiniBoss ?? false;
    this.isPrimaryTarget = options.isPrimaryTarget ?? false;
    this.scaleMultiplier = options.scaleMultiplier ?? (this.isMiniBoss ? 1.8 : 1);
    this.maxHealth = enemy.health;
    this.health = this.maxHealth;

    const style = getEnemyStyle(enemy.id);
    const shadow = scene.add.ellipse(0, 8, style.shadowWidth, 14, 0x000000, 0.36);
    const body =
      enemy.id === "spacing-wisp"
        ? scene.add.ellipse(0, -42, 62, 76, style.bodyColor)
        : scene.add.rectangle(0, -42, 76, 84, style.bodyColor);
    const core =
      enemy.id === "spacing-wisp"
        ? scene.add.ellipse(0, -42, 32, 38, style.coreColor)
        : scene.add.rectangle(0, -42, 42, 44, style.coreColor);
    const label = scene.add
      .text(0, 22, enemy.name, {
        color: style.textColor,
        fontFamily: "monospace",
        fontSize: this.isMiniBoss ? "16px" : "14px",
      })
      .setOrigin(0.5);

    body.setStrokeStyle(4, style.strokeColor);
    core.setStrokeStyle(2, style.coreStrokeColor);

    this.healthBar = scene.add.graphics();
    this.healthBar.setVisible(this.isMiniBoss);

    this.container = scene.add.container(x, y, [
      shadow,
      body,
      core,
      label,
      this.healthBar,
    ]);
    this.container.setName(enemy.id);
    this.container.setSize(76, 106);
    this.container.setDepth(y);
    this.drawHealthBar();

    if (this.isPrimaryTarget) {
      this.dispatchPrimaryTargetUpdate();
    }
  }

  setDepthScale(scale: number) {
    this.depthScale = scale;
    this.container.setScale(this.depthScale * this.scaleMultiplier);
    this.drawHealthBar();
  }

  getDamage() {
    return this.definition.damage;
  }

  getHurtbox() {
    const scaleX = Math.abs(this.container.scaleX);
    const scaleY = Math.abs(this.container.scaleY);

    if (this.definition.id === "spacing-wisp") {
      return new Phaser.Geom.Rectangle(
        this.container.x - 29 * scaleX,
        this.container.y - 78 * scaleY,
        58 * scaleX,
        72 * scaleY,
      );
    }

    return new Phaser.Geom.Rectangle(
      this.container.x - 34 * scaleX,
      this.container.y - 82 * scaleY,
      68 * scaleX,
      82 * scaleY,
    );
  }

  applyDamage(scene: Phaser.Scene, damage: number) {
    if (this.defeated) {
      return false;
    }

    this.health = Math.max(0, this.health - damage);
    this.healthBar.setVisible(true);
    this.drawHealthBar();

    if (this.isPrimaryTarget) {
      this.dispatchPrimaryTargetUpdate();
    }

    if (this.health > 0) {
      return true;
    }

    this.defeated = true;

    window.dispatchEvent(
      new CustomEvent("codebound:enemy-defeated",{
        detail: {
          id: this.definition.id,
          name: this.definition.name,
          xpReward: this.definition.xpReward,
        },
      }),
    );

    if (this.isPrimaryTarget) {
      window.dispatchEvent(new Event("codebound:primary-target-cleared"));
    }
    
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

  private drawHealthBar() {
    const width = this.isMiniBoss ? 88 : 58;
    const height = 6;
    const y = this.definition.id === "spacing-wisp" ? -92 : -100;
    const healthPercent = this.health / this.maxHealth;

    this.healthBar.clear();
    this.healthBar.fillStyle(0x18080d, 0.9);
    this.healthBar.fillRect(-width / 2, y, width, height);
    this.healthBar.fillStyle(this.isMiniBoss ? 0xc084fc : 0xef4444, 1);
    this.healthBar.fillRect(-width / 2, y, width * healthPercent, height);
    this.healthBar.lineStyle(1, 0xffffff, 0.45);
    this.healthBar.strokeRect(-width / 2, y, width, height);
  }

  private dispatchPrimaryTargetUpdate() {
    window.dispatchEvent(
      new CustomEvent("codebound:primary-target-updated", {
        detail: {
          id: this.definition.id,
          name: this.isMiniBoss
            ? "Mini Boss: " + this.definition.name
            : this.definition.name,
          health: this.health,
          maxHealth: this.maxHealth,
          damage: this.getDamage(),
          speed: this.definition.speed,
          category: this.definition.category,
          xpReward: this.definition.xpReward,
        },
      }),
    );
  }
}

function getEnemyStyle(enemyId: string) {
  if (enemyId === "spacing-wisp") {
    return {
      bodyColor: 0x7dd3fc,
      coreColor: 0x0e7490,
      strokeColor: 0xecfeff,
      coreStrokeColor: 0x67e8f9,
      textColor: "#ecfeff",
      shadowWidth: 54,
    };
  }

  if (enemyId === "null-wraith" || enemyId === "null-wraith-miniboss") {
    return {
      bodyColor: 0x3b0764,
      coreColor: 0x7f1d1d,
      strokeColor: 0xf5d0fe,
      coreStrokeColor: 0xfca5a5,
      textColor: "#f5d0fe",
      shadowWidth: 70,
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
