import * as Phaser from "phaser";

import { ARENA_LAYOUT, type ArenaPercentRect } from "@/game/config/arena";
import { ENEMIES, type EnemyDefinition } from "@/game/config/enemies";
import { PLAYER_PLACEHOLDER_TUNING } from "@/game/config/player";
import { javascriptLanguageWeapon } from "@/game/config/weapons";
import type { ArenaRect } from "@/game/domain/types";
import { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { CombatSystem } from "@/game/phaser/systems/CombatSystem";
import { EnemyMovementSystem } from "@/game/phaser/systems/EnemyMovementSystem";
import { EnemyProjectileSystem } from "@/game/phaser/systems/EnemyProjectileSystem";
import {
  EnemySpawnerSystem,
  type EnemySpawnRequest,
} from "@/game/phaser/systems/EnemySpawnerSystem";
import { PlayerMovementSystem } from "@/game/phaser/systems/PlayerMovementSystem";
//import { RewardSystem } from "@/game/phaser/systems/RewardSystem";
import { RunTimerSystem } from "@/game/phaser/systems/RunTimerSystem";
import { WeaponSystem } from "@/game/phaser/systems/WeaponSystem";
import { getDepthScale } from "@/game/phaser/worldDepth";
import type { ScreenShakeIntensity, WeaponEffect } from "@/types/weapon";
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
  private isDevMode = false;
  private isRunTimerPaused = false;
  private runTimerElapsedOffsetMs = 0;
  private runTimerStartedAtMs = 0;
  private isSpawningEnabled: boolean = true;
  private defeatedEnemyCount = 0;
  private handleDevModeChanged = (event: Event) => {
    const detail = (event as CustomEvent<{ isDevMode?: boolean }>).detail;

    this.isDevMode = detail?.isDevMode ?? false;
    this.weaponSystem?.setDevMode(this.isDevMode);
  };

  private handleDevSpawnEnemy = (event: Event) => {
    const detail = (event as CustomEvent<{ enemyId?: string }>).detail;
    const { width, height } = this.scale;
    const walkableArea = getPixelRect(ARENA_LAYOUT.walkableArea, width, height);
    const enemyDefinition =
      ENEMIES.find((enemy) => enemy.id === detail?.enemyId) ??
      ENEMIES[Math.floor(Math.random() * ENEMIES.length)];

    this.spawnEnemy(
      enemyDefinition,
      walkableArea.x + walkableArea.width + 96,
      Phaser.Math.Between(
        walkableArea.y + 28,
        walkableArea.y + walkableArea.height - 16,
      ),
      {
        entryTargetX: walkableArea.x + walkableArea.width * 0.78,
      },
    );
  };

  private handleDevRunTimerChanged = (event: Event) => {
    const detail = (event as CustomEvent<{
      isPaused?: boolean;
      isRestarted?: boolean;
    }>).detail;

    if (detail?.isRestarted) {
      this.runTimerElapsedOffsetMs = 0;
      this.runTimerStartedAtMs = this.time.now;
      this.isRunTimerPaused = false;
      this.isSpawningEnabled = true;
      this.enemySpawner?.reset();
      return;
    }

    if (detail?.isPaused && !this.isRunTimerPaused) {
      this.runTimerElapsedOffsetMs += this.time.now - this.runTimerStartedAtMs;
      this.isRunTimerPaused = true;
      return;
    }

    if (detail?.isPaused === false && this.isRunTimerPaused) {
      this.runTimerStartedAtMs = this.time.now;
      this.isRunTimerPaused = false;
    }
  };

  private handleDevSkipToMiniboss = (event: Event) => {
    const detail = (event as CustomEvent<{ elapsedMs?: number }>).detail;
    const elapsedMs = detail?.elapsedMs ?? 149_000;

    this.runTimerElapsedOffsetMs = elapsedMs;
    this.runTimerStartedAtMs = this.time.now;
    this.isRunTimerPaused = false;
    this.isSpawningEnabled = true;
    this.enemySpawner?.skipToElapsed(elapsedMs);
  };

  private handleEnemyDefeated = (event: Event) => {
    this.defeatedEnemyCount += 1;

    const detail = (event as CustomEvent<{ id?: string }>).detail;
    const didDefeatFinalTarget = detail?.id === "null-wraith-miniboss";

    if (!didDefeatFinalTarget) {
      return;
    }

    this.isSpawningEnabled = false;
    this.time.delayedCall(350, () => {
      window.dispatchEvent(new Event("codebound:run-victory"));
      this.scene.pause();
    });
  };

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image('code-campus-bg', '/backgrounds/code-campus.png');
  }

  create() {
    this.enemies = [];
    this.defeatedEnemyCount = 0;
    this.isSpawningEnabled = true;
    this.isDevMode = getCurrentDevMode();
    this.isRunTimerPaused = getCurrentRunTimerPaused();
    this.runTimerElapsedOffsetMs = 0;
    this.runTimerStartedAtMs = this.time.now;
    const { width, height } = this.scale;
    const walkableArea = getPixelRect(ARENA_LAYOUT.walkableArea, width, height);
    const playerX = (PLAYER_PLACEHOLDER_TUNING.xPercent / 100) * width;
    const playerY =
      (PLAYER_PLACEHOLDER_TUNING.groundYPercent / 100) * height;
    

    this.cameras.main.setBackgroundColor("#101827");
    this.drawArena(walkableArea);

    const player = new PlayerActor(this, playerX, playerY);
    player.setDepthScale(getDepthScale(playerY, walkableArea));

    this.playerMovement = new PlayerMovementSystem(this, player, walkableArea);
    this.enemyMovement = new EnemyMovementSystem(
      this,
      this.enemies,
      player,
      walkableArea,
    );
    this.enemyProjectiles = new EnemyProjectileSystem(
      this,
      this.enemies,
      player,
      walkableArea,
    );
    this.enemySpawner = new EnemySpawnerSystem();
    this.combat = new CombatSystem();
    this.runTimer = new RunTimerSystem();
    this.weaponSystem = new WeaponSystem(
      this,
      player,
      this.enemies,
    );
    this.weaponSystem.setDevMode(this.isDevMode);

    const handlePrimaryWeaponFired = (event: Event) => {
      const detail = (event as CustomEvent<{
        damage?: number;
        effect?: WeaponEffect;
        range?: number;
        screenShakeIntensity?: ScreenShakeIntensity;
      }>).detail;
      const damage = detail?.damage ?? javascriptLanguageWeapon.damage;
      const effect = detail?.effect ?? javascriptLanguageWeapon.effect;
      const range = detail?.range ?? javascriptLanguageWeapon.range;
      const screenShakeIntensity =
        detail?.screenShakeIntensity ?? javascriptLanguageWeapon.screenShakeIntensity;

      this.weaponSystem?.fire(effect, damage, range, screenShakeIntensity);
    };

    window.addEventListener(
      "codebound:primary-weapon-fired",
      handlePrimaryWeaponFired,
    );
    window.addEventListener("codebound:run-paused", this.pauseScene);
    window.addEventListener("codebound:run-restarted", this.restartScene);
    window.addEventListener(
      "codebound:dev-mode-changed",
      this.handleDevModeChanged,
    );
    window.addEventListener(
      "codebound:dev-spawn-enemy",
      this.handleDevSpawnEnemy,
    );
    window.addEventListener(
      "codebound:dev-run-timer-changed",
      this.handleDevRunTimerChanged,
    );
    window.addEventListener(
      "codebound:dev-skip-to-miniboss",
      this.handleDevSkipToMiniboss,
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(
        "codebound:primary-weapon-fired",
        handlePrimaryWeaponFired,
      );
      window.removeEventListener("codebound:run-paused", this.pauseScene);
      window.removeEventListener("codebound:run-restarted", this.restartScene);
      window.removeEventListener(
        "codebound:dev-mode-changed",
        this.handleDevModeChanged,
      );
      window.removeEventListener(
        "codebound:dev-spawn-enemy",
        this.handleDevSpawnEnemy,
      );
      window.removeEventListener(
        "codebound:dev-run-timer-changed",
        this.handleDevRunTimerChanged,
      );
      window.removeEventListener(
        "codebound:dev-skip-to-miniboss",
        this.handleDevSkipToMiniboss,
      );
    });

    window.addEventListener("codebound:enemy-defeated", this.handleEnemyDefeated)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(
        "codebound:enemy-defeated",
        this.handleEnemyDefeated,
      );
    });
  }

  update(time: number, delta: number) {
    this.playerMovement?.update(delta);
    this.enemyMovement?.update(time, delta);
    this.enemyProjectiles?.update(time, delta);
    this.combat?.update();

    const runElapsedMs = this.isRunTimerPaused
      ? this.runTimerElapsedOffsetMs
      : this.runTimerElapsedOffsetMs + time - this.runTimerStartedAtMs;

    if (this.isSpawningEnabled && !this.isRunTimerPaused) {
      this.spawnReadyWaves(this.enemySpawner?.update(runElapsedMs) ?? []);
    }
    const remainingSeconds = this.runTimer?.getRemainingSeconds(runElapsedMs);
    if (!this.isRunTimerPaused && remainingSeconds === 0) {
      this.isSpawningEnabled = false;
    }
  }

  private getActiveEnemyCount(): number {
  return this.enemies.filter((enemy) => !enemy.isDefeated()).length;
  }

  private spawnReadyWaves(spawnRequests: EnemySpawnRequest[]) {
    for (const request of spawnRequests) {
      for (let index = 0; index < request.count; index += 1) {
        if (this.getActiveEnemyCount() >= RUN_TUNING.maxActiveEnemies) {
          return;
        }

        const enemyDefinition = ENEMIES.find(
          (enemy) => enemy.id === request.enemyId,
        );

        if (!enemyDefinition) {
          continue;
        }

        const walkableArea = getPixelRect(
          ARENA_LAYOUT.walkableArea,
          this.scale.width,
          this.scale.height,
        );
        const spawnX = walkableArea.x + walkableArea.width + 96 + index * 34;
        const spawnY = Phaser.Math.Between(
          walkableArea.y + 28,
          walkableArea.y + walkableArea.height - 16,
        );

        this.spawnEnemy(enemyDefinition, spawnX, spawnY, {
          isMiniBoss: request.isMiniBoss,
          isPrimaryTarget: request.isMiniBoss,
          entryTargetX: walkableArea.x + walkableArea.width * 0.78,
        });
      }
    }
  }

  private spawnEnemy(
    enemyDefinition: EnemyDefinition,
    x: number,
    y: number,
    options: {
      isMiniBoss?: boolean;
      isPrimaryTarget?: boolean;
      entryTargetX?: number;
    } = {},
  ) {
    const enemy = new EnemyActor(this, enemyDefinition, x, y, {
      isMiniBoss: options.isMiniBoss,
      isPrimaryTarget: options.isPrimaryTarget,
    });
    if (options.entryTargetX !== undefined) {
      enemy.container.setData("entryTargetX", options.entryTargetX);
    }
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

    const background = this.add.image(width / 2, height / 2, "code-campus-bg");
    background.setOrigin(0.5, 0.5);

    const scaleX = width / background.width;
    const scaleY = height / background.height;
    const scale = Math.max(scaleX, scaleY);

    background.setScale(scale);
    background.setDepth(-10);

    /// optional walkable area overlay
    const battlefield = this.add.graphics();
    battlefield.fillStyle(0x172033, 0.45);
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
    battlefield.setDepth(-5);


    // this.add.rectangle(width / 2, height / 2, width, height, 0x071018);
    // this.add.rectangle(
    //   width / 2,
    //   height * 0.32,
    //   width,
    //   height * 0.42,
    //   0x14384f,
    //   0.7,
    // );
    // this.add.rectangle(
    //   width / 2,
    //   height * 0.58,
    //   width,
    //   height * 0.34,
    //   0x0f2230,
    //   0.8,
    // );

    // const battlefield = this.add.graphics();
    // battlefield.fillStyle(0x172033, 1);
    // battlefield.fillRoundedRect(
    //   walkableArea.x,
    //   walkableArea.y,
    //   walkableArea.width,
    //   walkableArea.height,
    //   18,
    // );
    // battlefield.lineStyle(2, 0x22d3ee, 0.35);
    // battlefield.strokeRoundedRect(
    //   walkableArea.x,
    //   walkableArea.y,
    //   walkableArea.width,
    //   walkableArea.height,
    //   18,
    // );
  }

  private restartScene = () => {
    this.scene.resume();
    this.scene.restart();
  };

  private pauseScene = () => {
    this.scene.pause();
  };
}

function getCurrentDevMode() {
  const codeboundWindow = window as Window & {
    __codeboundDevMode?: boolean;
  };

  return codeboundWindow.__codeboundDevMode ?? false;
}

function getCurrentRunTimerPaused() {
  const codeboundWindow = window as Window & {
    __codeboundRunTimerPaused?: boolean;
  };

  return codeboundWindow.__codeboundRunTimerPaused ?? false;
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
