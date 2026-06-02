import * as Phaser from "phaser";

import { ARENA_LAYOUT, type ArenaPercentRect } from "@/game/config/arena";
import { ENEMIES, type EnemyDefinition } from "@/game/config/enemies";
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
import { EnemyProjectileSystem } from "@/game/phaser/systems/EnemyProjectileSystem";
import { EnemySpawnerSystem } from "@/game/phaser/systems/EnemySpawnerSystem";
import { PlayerMovementSystem } from "@/game/phaser/systems/PlayerMovementSystem";
//import { RewardSystem } from "@/game/phaser/systems/RewardSystem";
import { RunTimerSystem } from "@/game/phaser/systems/RunTimerSystem";
import { WeaponSystem } from "@/game/phaser/systems/WeaponSystem";
import { getDepthScale } from "@/game/phaser/worldDepth";
import type { WeaponEffect } from "@/types/weapon";
import { RUN_TUNING } from "@/game/config/run";

export default class GameScene extends Phaser.Scene {
  private playerMovement?: PlayerMovementSystem;
  private enemyMovement?: EnemyMovementSystem;
  private enemyProjectiles?: EnemyProjectileSystem;
  private enemySpawner?: EnemySpawnerSystem;
  private combat?: CombatSystem;
  private runTimer?: RunTimerSystem;
  private weaponSystem?: WeaponSystem;
  private enemies: EnemyActor[] = [];
  private isSpawningEnabled: boolean = true;

  constructor() {
    super("GameScene");
  }

  create() {
    const language = LANGUAGES[0];
    const enemyDefinition = ENEMIES[1];
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
    
    // Loading two enemies in using EnemyActor to see if I can create more than one
    this.spawnEnemy(ENEMIES[0],enemyX,enemyY);
    const wisp = this.spawnEnemy(ENEMIES[1], width - 80, enemyY - 80);

    const player = new PlayerActor(this, playerX, playerY);
    player.setDepthScale(getDepthScale(playerY, walkableArea));
    const enemy = wisp;
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
    this.enemyMovement = new EnemyMovementSystem(this.enemies, walkableArea);
    this.enemyProjectiles = new EnemyProjectileSystem(
      this,
      enemy,
      player,
      walkableArea,
    );
    this.enemySpawner = new EnemySpawnerSystem();
    this.combat = new CombatSystem();
    this.runTimer = new RunTimerSystem();
    this.weaponSystem = new WeaponSystem(
      this,
      player,
      enemy,
    );

    const handlePrimaryWeaponFired = (event: Event) => {
      const detail = (event as CustomEvent<{
        damage?: number;
        effect?: WeaponEffect;
        range?: number;
      }>).detail;
      const damage = detail?.damage ?? javascriptLanguageWeapon.damage;
      const effect = detail?.effect ?? javascriptLanguageWeapon.effect;
      const range = detail?.range ?? javascriptLanguageWeapon.range;

      this.weaponSystem?.fire(effect, damage, range);
      if (effect === "straight-shot") {
        return;
      }

      DamageNumberEffects.show(
        this,
        enemy.container.x,
        enemy.container.y - 82,
        damage,
      );
      HitFeedbackEffects.flash(this, enemy.container);
    };

    window.addEventListener(
      "codebound:primary-weapon-fired",
      handlePrimaryWeaponFired,
    );
    window.addEventListener("codebound:run-paused", this.pauseScene);
    window.addEventListener("codebound:run-restarted", this.restartScene);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(
        "codebound:primary-weapon-fired",
        handlePrimaryWeaponFired,
      );
      window.removeEventListener("codebound:run-paused", this.pauseScene);
      window.removeEventListener("codebound:run-restarted", this.restartScene);
    });
  }

  update(time: number, delta: number) {
    this.playerMovement?.update(delta);
    this.enemyMovement?.update(delta);
    this.enemyProjectiles?.update(time, delta);
    this.combat?.update();

    if (this.isSpawningEnabled && this.enemySpawner?.update(time) && this.enemies.length < RUN_TUNING.maxActiveEnemies) {
      this.spawnEnemy(
        ENEMIES[Math.floor(Math.random() * ENEMIES.length)],
        this.scale.width - 80,
        this.scale.height * Phaser.Math.FloatBetween(.42,.66),
      );
      this.enemySpawner.slowDown();
    }

    const remainingSeconds = this.runTimer?.getRemainingSeconds(time);
    if (remainingSeconds === 0){
      this.isSpawningEnabled = false;
    }
  }

  private spawnEnemy(enemyDefinition: EnemyDefinition, x: number, y:number){
    const enemy = new EnemyActor(this, enemyDefinition, x, y);
    enemy.setDepthScale(
      getDepthScale(
        y,
        getPixelRect(
          ARENA_LAYOUT.walkableArea,
          this.scale.width,
          this.scale.height,
        ),
      ),
    );
    this.enemies.push(enemy);
    return enemy;
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

  private restartScene = () => {
    this.scene.resume();
    this.scene.restart();
  };

  private pauseScene = () => {
    this.scene.pause();
  };
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
