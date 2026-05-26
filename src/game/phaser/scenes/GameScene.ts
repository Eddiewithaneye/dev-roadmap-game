import * as Phaser from "phaser";

import { ARENA_LAYOUT, type ArenaPercentRect } from "@/game/config/arena";
import { ENEMIES } from "@/game/config/enemies";
import { LANGUAGES } from "@/game/config/languages";
import { PLAYER_PLACEHOLDER_TUNING } from "@/game/config/player";
import { javascriptLanguageWeapon } from "@/game/config/weapons";
import type { ArenaRect } from "@/game/domain/types";
import { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { DamageNumberEffects } from "@/game/phaser/effects/DamageNumberEffects";
import { HitFeedbackEffects } from "@/game/phaser/effects/HitFeedbackEffects";
import { CombatSystem } from "@/game/phaser/systems/CombatSystem";
import { EnemyMovementSystem } from "@/game/phaser/systems/EnemyMovementSystem";
import { EnemySpawnerSystem } from "@/game/phaser/systems/EnemySpawnerSystem";
import { PlayerMovementSystem } from "@/game/phaser/systems/PlayerMovementSystem";
import { RewardSystem } from "@/game/phaser/systems/RewardSystem";
import { RunTimerSystem } from "@/game/phaser/systems/RunTimerSystem";
import { WeaponSystem } from "@/game/phaser/systems/WeaponSystem";

export default class GameScene extends Phaser.Scene {
  private playerMovement?: PlayerMovementSystem;
  private enemyMovement?: EnemyMovementSystem;
  private enemySpawner?: EnemySpawnerSystem;
  private combat?: CombatSystem;
  private runTimer?: RunTimerSystem;
  private weaponSystem?: WeaponSystem;

  constructor() {
    super("GameScene");
  }

  create() {
    const language = LANGUAGES[0];
    const enemyDefinition = ENEMIES[0];
    const { width, height } = this.scale;
    const centerX = width / 2;
    const walkableArea = getPixelRect(ARENA_LAYOUT.walkableArea, width, height);
    const playerX = (PLAYER_PLACEHOLDER_TUNING.xPercent / 100) * width;
    const playerY =
      (PLAYER_PLACEHOLDER_TUNING.groundYPercent / 100) * height;
    const enemyX = walkableArea.x + walkableArea.width * 0.72;
    const enemyY = walkableArea.y + walkableArea.height * 0.68;

    this.cameras.main.setBackgroundColor("#101827");
    this.drawArena(walkableArea);

    this.add
      .text(centerX, 112, "Codebound", {
        color: "#e0f2fe",
        fontFamily: "monospace",
        fontSize: "32px",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 156, "Phaser is rendering inside Next.js", {
        color: "#67e8f9",
        fontFamily: "monospace",
        fontSize: "18px",
      })
      .setOrigin(0.5);

    const player = new PlayerActor(this, playerX, playerY);
    const enemy = new EnemyActor(this, enemyDefinition, enemyX, enemyY);

    this.add
      .text(
        centerX,
        walkableArea.y + walkableArea.height + 42,
        `${language.name} ${language.manifestation} ready | ${enemyDefinition.health} HP target`,
        {
          color: "#bae6fd",
          fontFamily: "monospace",
          fontSize: "18px",
        },
      )
      .setOrigin(0.5);

    this.playerMovement = new PlayerMovementSystem(this, player, walkableArea);
    this.enemyMovement = new EnemyMovementSystem(enemy, player);
    this.enemySpawner = new EnemySpawnerSystem();
    this.combat = new CombatSystem();
    this.runTimer = new RunTimerSystem();
    this.weaponSystem = new WeaponSystem(
      this,
      javascriptLanguageWeapon,
      player,
      enemy,
    );

    this.input.keyboard?.on("keydown-SPACE", () => {
      this.weaponSystem?.tryFire(this.time.now);
      DamageNumberEffects.show(
        this,
        enemy.container.x,
        enemy.container.y - 82,
        javascriptLanguageWeapon.damage,
      );
      HitFeedbackEffects.flash(this, enemy.container);
    });
  }

  update(time: number, delta: number) {
    this.playerMovement?.update(delta);
    this.enemyMovement?.update(delta);
    this.combat?.update();

    if (this.enemySpawner?.update(time)) {
      const rewardSystem = new RewardSystem(this);
      rewardSystem.spawnDefaultReward(
        this.scale.width * 0.82,
        this.scale.height * 0.54,
      );
    }

    this.runTimer?.getRemainingSeconds(time);
  }

  private drawArena(walkableArea: ArenaRect) {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x071018);
    this.add.rectangle(
      width / 2,
      height * 0.32,
      width,
      height * 0.42,
      0x14384f,
      0.7,
    );
    this.add.rectangle(
      width / 2,
      height * 0.58,
      width,
      height * 0.34,
      0x0f2230,
      0.8,
    );

    const battlefield = this.add.graphics();
    battlefield.fillStyle(0x172033, 1);
    battlefield.fillRoundedRect(
      walkableArea.x,
      walkableArea.y,
      walkableArea.width,
      walkableArea.height,
      18,
    );
    battlefield.lineStyle(2, 0x22d3ee, 0.35);
    battlefield.strokeRoundedRect(
      walkableArea.x,
      walkableArea.y,
      walkableArea.width,
      walkableArea.height,
      18,
    );
  }
}

function getPixelRect(
  rect: ArenaPercentRect,
  width: number,
  height: number,
): ArenaRect {
  return {
    x: (rect.xPercent / 100) * width,
    y: (rect.yPercent / 100) * height,
    width: (rect.widthPercent / 100) * width,
    height: (rect.heightPercent / 100) * height,
  };
}
