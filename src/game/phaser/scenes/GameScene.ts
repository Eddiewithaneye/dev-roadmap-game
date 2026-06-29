import * as Phaser from "phaser";

import { ARENA_LAYOUT, type ArenaPercentRect } from "@/game/config/arena";
import { ENEMIES, type EnemyDefinition } from "@/game/config/enemies";
import { PLAYER_PLACEHOLDER_TUNING } from "@/game/config/player";
import { javascriptLanguageWeapon } from "@/game/config/weapons";
import type { ArenaRect } from "@/game/domain/types";
import { CodeFragmentPickup } from "@/game/phaser/objects/CodeFragmentPickup";
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
import { VirtualJoystickSystem } from "@/game/phaser/systems/VirtualJoystickSystem";
import { WeaponSystem } from "@/game/phaser/systems/WeaponSystem";
import { getDepthScale, type DepthScaleProfile } from "@/game/phaser/worldDepth";
import type { ScreenShakeIntensity, WeaponEffect } from "@/types/weapon";
import { RUN_TUNING } from "@/game/config/run";
import {
  getDepthScaleProfile,
  getGameplayScale,
} from "@/game/phaser/gameplayScale";

export default class GameScene extends Phaser.Scene {
  private playerMovement?: PlayerMovementSystem;
  private enemyMovement?: EnemyMovementSystem;
  private enemyProjectiles?: EnemyProjectileSystem;
  private enemySpawner?: EnemySpawnerSystem;
  private combat?: CombatSystem;
  private runTimer?: RunTimerSystem;
  private virtualJoystick?: VirtualJoystickSystem;
  private weaponSystem?: WeaponSystem;
  private player?: PlayerActor;
  private enemies: EnemyActor[] = [];
  private codeFragmentPickups: CodeFragmentPickup[] = [];
  private pendingSpawnRequests: EnemySpawnRequest[] = [];
  private isDevMode = false;
  private isRunTimerPaused = false;
  private runTimerElapsedOffsetMs = 0;
  private runTimerStartedAtMs = 0;
  private isSpawningEnabled: boolean = true;
  private nextSprintPressureSpawnAtMs: number =
    RUN_TUNING.sprintPressureSpawnStartMs;
  private isWaterfallMode = false;
  private waterfallWaveNumber = 0;
  private nextWaterfallWaveAtMs = 0;
  private defeatedEnemyCount = 0;
  private gameplayScale = 1;
  private depthScaleProfile?: DepthScaleProfile;
  private handleInputModeChanged = (event: Event) => {
    const detail = (event as CustomEvent<{ inputMode?: string }>).detail;

    this.virtualJoystick?.setEnabled(detail?.inputMode === "touch-landscape");
  };

  private handleDevModeChanged = (event: Event) => {
    const detail = (event as CustomEvent<{ isDevMode?: boolean }>).detail;

    this.isDevMode = detail?.isDevMode ?? false;
    this.weaponSystem?.setDevMode(this.isDevMode);
  };

  private handleDevSpawnEnemy = (event: Event) => {
    const detail = (event as CustomEvent<{ enemyId?: string }>).detail;
    const { width, height } = this.scale;
    this.gameplayScale = getGameplayScale(width, height);
    this.depthScaleProfile = getDepthScaleProfile(width, height);
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
      this.nextSprintPressureSpawnAtMs = RUN_TUNING.sprintPressureSpawnStartMs;
      this.isWaterfallMode = false;
      this.waterfallWaveNumber = 0;
      this.nextWaterfallWaveAtMs = 0;
      this.pendingSpawnRequests = [];
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
    this.nextSprintPressureSpawnAtMs = elapsedMs;
    this.isWaterfallMode = false;
    this.waterfallWaveNumber = 0;
    this.nextWaterfallWaveAtMs = 0;
    this.pendingSpawnRequests = [];
    this.enemySpawner?.skipToElapsed(elapsedMs);
  };

  private handleWaterfallStarted = () => {
    this.isWaterfallMode = true;
    this.isSpawningEnabled = true;
    this.isRunTimerPaused = false;
    this.pendingSpawnRequests = [];
    this.waterfallWaveNumber = 0;
    this.nextWaterfallWaveAtMs = this.time.now;
    this.spawnNextWaterfallWave();
    this.nextWaterfallWaveAtMs =
      this.time.now + RUN_TUNING.waterfallWaveIntervalMs;
  };

  private handleEnemyDefeated = (event: Event) => {
    this.defeatedEnemyCount += 1;

    const detail = (event as CustomEvent<{
      id?: string;
      x?: number;
      y?: number;
      codeFragmentReward?: number;
    }>).detail;
    const didDefeatFinalTarget = detail?.id === "null-wraith-miniboss";
    const codeFragmentReward = detail?.codeFragmentReward ?? 0;

    if (
      codeFragmentReward > 0 &&
      detail?.x !== undefined &&
      detail?.y !== undefined
    ) {
      this.codeFragmentPickups.push(
        new CodeFragmentPickup(
          this,
          detail.x,
          detail.y,
          codeFragmentReward,
          Phaser.Math.Clamp(this.gameplayScale * 0.82, 0.48, 0.78),
        ),
      );
    }

    if (!didDefeatFinalTarget || this.isWaterfallMode) {
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
    this.codeFragmentPickups = [];
    this.pendingSpawnRequests = [];
    this.defeatedEnemyCount = 0;
    this.isSpawningEnabled = true;
    this.nextSprintPressureSpawnAtMs = RUN_TUNING.sprintPressureSpawnStartMs;
    this.isWaterfallMode = false;
    this.waterfallWaveNumber = 0;
    this.nextWaterfallWaveAtMs = 0;
    this.isDevMode = getCurrentDevMode();
    this.isRunTimerPaused = getCurrentRunTimerPaused();
    this.runTimerElapsedOffsetMs = 0;
    this.runTimerStartedAtMs = this.time.now;
    const { width, height } = this.scale;
    this.gameplayScale = getGameplayScale(width, height);
    this.depthScaleProfile = getDepthScaleProfile(width, height);
    const walkableArea = getPixelRect(ARENA_LAYOUT.walkableArea, width, height);
    const playerX = (PLAYER_PLACEHOLDER_TUNING.xPercent / 100) * width;
    const playerY =
      (PLAYER_PLACEHOLDER_TUNING.groundYPercent / 100) * height;
    

    this.cameras.main.setBackgroundColor("#101827");
    this.drawArena(walkableArea);

    this.player = new PlayerActor(this, playerX, playerY, this.gameplayScale);
    this.player.setDepthScale(
      getDepthScale(playerY, walkableArea, this.depthScaleProfile),
    );

    this.playerMovement = new PlayerMovementSystem(
      this,
      this.player,
      walkableArea,
      this.gameplayScale,
      this.depthScaleProfile,
    );
    this.virtualJoystick = new VirtualJoystickSystem(this);
    this.virtualJoystick.setEnabled(getCurrentInputMode() === "touch-landscape");
    this.playerMovement.addInputSource(this.virtualJoystick);
    this.enemyMovement = new EnemyMovementSystem(
      this,
      this.enemies,
      this.player,
      walkableArea,
      this.gameplayScale,
      this.depthScaleProfile,
    );
    this.enemyProjectiles = new EnemyProjectileSystem(
      this,
      this.enemies,
      this.player,
      walkableArea,
      this.gameplayScale,
      this.depthScaleProfile,
    );
    this.enemySpawner = new EnemySpawnerSystem();
    this.combat = new CombatSystem();
    this.runTimer = new RunTimerSystem();
    this.weaponSystem = new WeaponSystem(
      this,
      this.player,
      this.enemies,
    );
    this.weaponSystem.setDevMode(this.isDevMode);

    const handlePrimaryWeaponFired = (event: Event) => {
      const detail = (event as CustomEvent<{
        damage?: number;
        effect?: WeaponEffect;
        range?: number;
        screenShakeIntensity?: ScreenShakeIntensity;
        attackId?: string | null;
        projectileCount?: number;
        pierce?: number;
        bounceCount?: number;
      }>).detail;
      const damage = detail?.damage ?? javascriptLanguageWeapon.damage;
      const effect = detail?.effect ?? javascriptLanguageWeapon.effect;
      const range = detail?.range ?? javascriptLanguageWeapon.range;
      const screenShakeIntensity =
        detail?.screenShakeIntensity ?? javascriptLanguageWeapon.screenShakeIntensity;

      this.weaponSystem?.fire(effect, damage, range, screenShakeIntensity, {
        attackId: detail?.attackId ?? null,
        projectileCount: detail?.projectileCount ?? 1,
        pierce: detail?.pierce ?? 0,
        bounceCount: detail?.bounceCount ?? 0,
      });
    };

    window.addEventListener(
      "codebound:primary-weapon-fired",
      handlePrimaryWeaponFired,
    );
    window.addEventListener("codebound:run-paused", this.pauseScene);
    window.addEventListener("codebound:run-resumed", this.resumeScene);
    window.addEventListener("codebound:run-restarted", this.restartScene);
    window.addEventListener(
      "codebound:input-mode-changed",
      this.handleInputModeChanged,
    );
    window.addEventListener(
      "codebound:waterfall-started",
      this.handleWaterfallStarted,
    );
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
      window.removeEventListener("codebound:run-resumed", this.resumeScene);
      window.removeEventListener("codebound:run-restarted", this.restartScene);
      window.removeEventListener(
        "codebound:input-mode-changed",
        this.handleInputModeChanged,
      );
      window.removeEventListener(
        "codebound:waterfall-started",
        this.handleWaterfallStarted,
      );
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
      this.virtualJoystick?.destroy();
      this.virtualJoystick = undefined;
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
    this.updateCodeFragmentPickups();

    const runElapsedMs = this.isRunTimerPaused
      ? this.runTimerElapsedOffsetMs
      : this.runTimerElapsedOffsetMs + time - this.runTimerStartedAtMs;

    if (this.isSpawningEnabled && !this.isRunTimerPaused) {
      if (this.isWaterfallMode) {
        this.updateWaterfallWaves(time);
      } else {
        this.spawnReadyWaves(this.enemySpawner?.update(runElapsedMs) ?? []);
        this.spawnSprintPressureWave(runElapsedMs);
      }
    }
    const remainingSeconds = this.runTimer?.getRemainingSeconds(runElapsedMs);
    if (!this.isWaterfallMode && !this.isRunTimerPaused && remainingSeconds === 0) {
      this.isSpawningEnabled = false;
    }
  }

  private getActiveEnemyCount(): number {
    return this.enemies.filter((enemy) => !enemy.isDefeated()).length;
  }

  private getPendingEnemyCount(): number {
    return this.pendingSpawnRequests.reduce(
      (total, request) => total + request.count,
      0,
    );
  }

  private spawnReadyWaves(spawnRequests: EnemySpawnRequest[]) {
    this.pendingSpawnRequests.push(...spawnRequests);
    this.pendingSpawnRequests.sort((left, right) => {
      if (left.isMiniBoss === right.isMiniBoss) {
        return 0;
      }

      return left.isMiniBoss ? -1 : 1;
    });
    this.spawnPendingRequests();
  }

  private spawnSprintPressureWave(elapsedMs: number) {
    if (
      elapsedMs < RUN_TUNING.sprintPressureSpawnStartMs ||
      elapsedMs < this.nextSprintPressureSpawnAtMs
    ) {
      return;
    }

    this.nextSprintPressureSpawnAtMs =
      elapsedMs + RUN_TUNING.sprintPressureSpawnIntervalMs;

    const visibleEnemyPressure =
      this.getActiveEnemyCount() + this.getPendingEnemyCount();

    if (visibleEnemyPressure >= RUN_TUNING.sprintPressureMinimumEnemies) {
      return;
    }

    const enemiesNeeded =
      RUN_TUNING.sprintPressureMinimumEnemies - visibleEnemyPressure;
    const pressureEnemyId =
      Math.floor(elapsedMs / RUN_TUNING.sprintPressureSpawnIntervalMs) % 2 === 0
        ? "syntax-gremlin"
        : "spacing-wisp";

    this.spawnReadyWaves([
      {
        enemyId: pressureEnemyId,
        count: Math.min(3, enemiesNeeded),
      },
    ]);
  }

  private updateWaterfallWaves(time: number) {
    while (time >= this.nextWaterfallWaveAtMs) {
      this.spawnNextWaterfallWave();
      this.nextWaterfallWaveAtMs += RUN_TUNING.waterfallWaveIntervalMs;
    }
  }

  private spawnNextWaterfallWave() {
    this.waterfallWaveNumber += 1;

    const totalEnemies =
      RUN_TUNING.waterfallInitialEnemyCount +
      (this.waterfallWaveNumber - 1) *
        RUN_TUNING.waterfallEnemyIncreasePerWave;
    const minibossCount =
      this.waterfallWaveNumber % 10 === 0
        ? 2
        : this.waterfallWaveNumber % 5 === 0
          ? 1
          : 0;
    const normalEnemyCount = Math.max(0, totalEnemies - minibossCount);
    const syntaxGremlinCount = Math.ceil(normalEnemyCount / 2);
    const spacingWispCount = normalEnemyCount - syntaxGremlinCount;
    const spawnRequests: EnemySpawnRequest[] = [];

    if (minibossCount > 0) {
      spawnRequests.push({
        enemyId: "null-wraith-miniboss",
        count: minibossCount,
        isMiniBoss: true,
      });
    }

    if (syntaxGremlinCount > 0) {
      spawnRequests.push({
        enemyId: "syntax-gremlin",
        count: syntaxGremlinCount,
      });
    }

    if (spacingWispCount > 0) {
      spawnRequests.push({
        enemyId: "spacing-wisp",
        count: spacingWispCount,
      });
    }

    this.spawnReadyWaves(spawnRequests);
  }

  private spawnPendingRequests() {
    while (
      this.pendingSpawnRequests.length > 0 &&
      this.getActiveEnemyCount() < RUN_TUNING.maxActiveEnemies
    ) {
      const request = this.pendingSpawnRequests[0];

      const enemyDefinition = ENEMIES.find(
        (enemy) => enemy.id === request.enemyId,
      );

      if (!enemyDefinition) {
        this.pendingSpawnRequests.shift();
        continue;
      }

      const walkableArea = getPixelRect(
        ARENA_LAYOUT.walkableArea,
        this.scale.width,
        this.scale.height,
      );
      const spawnX = walkableArea.x + walkableArea.width + 96;
      const spawnY = Phaser.Math.Between(
        walkableArea.y + 28,
        walkableArea.y + walkableArea.height - 16,
      );

      this.spawnEnemy(enemyDefinition, spawnX, spawnY, {
        isMiniBoss: request.isMiniBoss,
        isPrimaryTarget: request.isMiniBoss,
        entryTargetX: walkableArea.x + walkableArea.width * 0.78,
      });

      request.count -= 1;

      if (request.count <= 0) {
        this.pendingSpawnRequests.shift();
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
      gameplayScale: this.gameplayScale,
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
        this.depthScaleProfile,
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
    battlefield.fillStyle(0x172033, 0.22);
    battlefield.fillRoundedRect(
      walkableArea.x,
      walkableArea.y,
      walkableArea.width,
      walkableArea.height,
      18,
    );
    battlefield.lineStyle(2, 0x22d3ee, 0.18);
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

  private resumeScene = () => {
    this.scene.resume();
  };

  private updateCodeFragmentPickups() {
    if (!this.player) {
      return;
    }

    for (let index = this.codeFragmentPickups.length - 1; index >= 0; index -= 1) {
      if (this.codeFragmentPickups[index].update(this.player)) {
        this.codeFragmentPickups.splice(index, 1);
      }
    }
  }
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

function getCurrentInputMode() {
  const codeboundWindow = window as Window & {
    __codeboundInputMode?: string;
  };

  return codeboundWindow.__codeboundInputMode ?? "desktop";
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
