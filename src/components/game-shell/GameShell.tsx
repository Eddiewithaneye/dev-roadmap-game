"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { ENEMIES } from "@/game/config/enemies";
import { RUN_TUNING } from "@/game/config/run";
import {
  canAttack,
  damageEnemy,
  getNextReadyTime,
  spawnEnemy,
} from "@/game/domain/combat";
import { DevControls } from "./DevControls";
import { GameHud } from "./GameHud";
import { WeaponPanel } from "./WeaponPanel";
import type { DevToolsPosition, PrimaryTarget, WeaponSlot } from "./types";
import type {
  TunableWeaponSlot,
  WeaponTuningField,
} from "../game/stores/weaponSlice";
import { useGameStore } from "@/components/game/stores/useGameStore";

type GameShellProps = {
  children: ReactNode;
};

const WEAPON_SLOTS: WeaponSlot[] = ["language", "sql", "locked3", "locked4"];
export function GameShell({ children }: GameShellProps) {
  // PlayerSlice
  const health = useGameStore((state) => state.health);
  const xp = useGameStore((state) => state.xp);
  const xpGoal = useGameStore((state) => state.xpGoal);
  
  // GameSlice
  const grantXp = useGameStore((state) => state.grantXp);
  const takeDamage = useGameStore((state) => state.takeDamage);
  const defeatEnemy = useGameStore((state) => state.defeatEnemy);
  const resetRun = useGameStore((state) => state.resetRun);
  const weaponsBySlot = useGameStore((state) => state.weaponsBySlot);
  const updateTunedWeaponField = useGameStore(
    (state) => state.updateWeaponField,
  );
  
  // UI responsible state hooks
  const [, setEnemy] = useState(() => spawnEnemy());
  const [readyAtBySlot, setReadyAtBySlot] = useState<
    Partial<Record<WeaponSlot, number>>
  >({});
  const [now, setNow] = useState(() => Date.now());
  const [activeWeaponSlot, setActiveWeaponSlot] =
    useState<WeaponSlot>("language");
  const [isWeaponPanelOpen, setIsWeaponPanelOpen] = useState(false);
  const [, setIsUpgradePanelOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(() => getInitialDevMode());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [devToolsPosition, setDevToolsPosition] =
    useState<DevToolsPosition>(() => getInitialDevToolsPosition());
  const [isDevToolsMinimized, setIsDevToolsMinimized] = useState(false);
  const [runStartedAt, setRunStartedAt] = useState(() => Date.now());
  const [pausedRunElapsedMs, setPausedRunElapsedMs] = useState(0);
  const [isRunTimerPaused, setIsRunTimerPaused] = useState(false);
  const [isRunVictorious, setIsRunVictorious] = useState(false);
  const [primaryTarget, setPrimaryTarget] = useState<PrimaryTarget | null>(null);
  

  // constants  
  const isPlayerDefeated = health <= 0;
  const activeTunableSlot = getTunableWeaponSlot(activeWeaponSlot);
  const weapon = weaponsBySlot[activeTunableSlot ?? "language"];
  const weaponCooldownProgressBySlot = getCooldownProgressBySlot(
    readyAtBySlot,
    now,
    weaponsBySlot,
  );

  const runElapsedMs = isRunTimerPaused
    ? pausedRunElapsedMs
    : pausedRunElapsedMs + now - runStartedAt;
  const remainingRunSeconds = Math.max(
    0,
    RUN_TUNING.survivalGoalSeconds - Math.floor(runElapsedMs / 1000),
  );

  const isRunOver = !isRunVictorious && (isPlayerDefeated || remainingRunSeconds <= 0);

  const runTimeLabel = formatRunTime(remainingRunSeconds);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const codeboundWindow = window as Window & {
      __codeboundDevMode?: boolean;
      __codeboundRunTimerPaused?: boolean;
    };

    codeboundWindow.__codeboundDevMode = isDevMode;
    window.dispatchEvent(
      new CustomEvent("codebound:dev-mode-changed", {
        detail: { isDevMode },
      }),
    );
  }, [isDevMode]);

  useEffect(() => {
    const codeboundWindow = window as Window & {
      __codeboundRunTimerPaused?: boolean;
    };

    codeboundWindow.__codeboundRunTimerPaused = isRunTimerPaused;
    window.dispatchEvent(
      new CustomEvent("codebound:dev-run-timer-changed", {
        detail: { isPaused: isRunTimerPaused, isRestarted: false },
      }),
    );
  }, [isRunTimerPaused]);

  const selectWeapon = useCallback((slot: WeaponSlot) => {
    setActiveWeaponSlot(slot);
  }, []);

  const cycleWeapon = useCallback(
    (direction: 1 | -1) => {
      const currentIndex = WEAPON_SLOTS.indexOf(activeWeaponSlot);
      const nextIndex =
        (currentIndex + direction + WEAPON_SLOTS.length) % WEAPON_SLOTS.length;
      selectWeapon(WEAPON_SLOTS[nextIndex]);
    },
    [activeWeaponSlot, selectWeapon],
  );

  const applyEnemyDamage = useCallback(
    (damage: number) => {
      setEnemy((currentEnemy) => {
        const nextEnemy = damageEnemy(
          { ...weapon, damage },
          currentEnemy,
        );

        if (currentEnemy.health > 0 && nextEnemy.health === 0) {
          window.setTimeout(() => {
            setEnemy(spawnEnemy());
          }, 600);
        }

        return nextEnemy;
      });
    },
    [weapon],
  );

  const fireWeapon = useCallback((slot: WeaponSlot) => {
    if (isPlayerDefeated) {
      return;
    }

    const tunableSlot = getTunableWeaponSlot(slot);

    if (!tunableSlot) {
      return;
    }

    const selectedWeapon = weaponsBySlot[tunableSlot];

    const attackTime = Date.now();
    const slotReadyAt = readyAtBySlot[slot] ?? 0;

    if (!canAttack(slotReadyAt, attackTime)) {
      return;
    }

    setReadyAtBySlot((current) => ({
      ...current,
      [slot]: getNextReadyTime(selectedWeapon, attackTime),
    }));
    window.dispatchEvent(
      new CustomEvent("codebound:primary-weapon-fired", {
        detail: {
          damage: selectedWeapon.damage,
          effect: selectedWeapon.effect,
          range: selectedWeapon.range,
          screenShakeIntensity: selectedWeapon.screenShakeIntensity,
        },
      }),
    );

  }, [isPlayerDefeated, readyAtBySlot, weaponsBySlot]);

  const handleAttack = useCallback(() => {
    fireWeapon(activeWeaponSlot);
  }, [activeWeaponSlot, fireWeapon]);

  const spawnRandomEnemy = useCallback(() => {
    const enemyDefinition = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];

    setEnemy(spawnEnemy(enemyDefinition.id));
    window.dispatchEvent(
      new CustomEvent("codebound:dev-spawn-enemy", {
        detail: { enemyId: enemyDefinition.id },
      }),
    );
  }, []);

  const skipToMiniboss = useCallback(() => {
    const minibossPreviewElapsedMs = 149_000;

    setPausedRunElapsedMs(minibossPreviewElapsedMs);
    setRunStartedAt(Date.now());
    setIsRunTimerPaused(false);

    window.dispatchEvent(
      new CustomEvent("codebound:dev-skip-to-miniboss", {
        detail: { elapsedMs: minibossPreviewElapsedMs },
      }),
    );
  }, []);

  const playRunTimer = useCallback(() => {
    if (!isRunTimerPaused) {
      return;
    }

    setRunStartedAt(Date.now());
    setIsRunTimerPaused(false);
    window.dispatchEvent(
      new CustomEvent("codebound:dev-run-timer-changed", {
        detail: { isPaused: false, isRestarted: false },
      }),
    );
  }, [isRunTimerPaused]);

  const pauseRunTimer = useCallback(() => {
    if (isRunTimerPaused) {
      return;
    }

    setPausedRunElapsedMs((elapsedMs) => elapsedMs + Date.now() - runStartedAt);
    setIsRunTimerPaused(true);
    window.dispatchEvent(
      new CustomEvent("codebound:dev-run-timer-changed", {
        detail: { isPaused: true, isRestarted: false },
      }),
    );
  }, [isRunTimerPaused, runStartedAt]);

  const restartRunTimer = useCallback(() => {
    setPausedRunElapsedMs(0);
    setRunStartedAt(Date.now());
    setIsRunTimerPaused(false);
    setIsRunVictorious(false);
    setPrimaryTarget(null);
    window.dispatchEvent(
      new CustomEvent("codebound:dev-run-timer-changed", {
        detail: { isPaused: false, isRestarted: true },
      }),
    );
  }, []);

  const restartRun = useCallback(() => {
    resetRun();
    setEnemy(spawnEnemy());
    setReadyAtBySlot({});
    setPausedRunElapsedMs(0);
    setRunStartedAt(Date.now());
    setIsRunTimerPaused(false);
    setIsRunVictorious(false);
    setIsUpgradePanelOpen(false);
    window.dispatchEvent(new Event("codebound:run-restarted"));
  }, [resetRun]);


  useEffect(() => {
    function handlePrimaryWeaponAttack() {
      handleAttack();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        handleAttack();
        return;
      }

      if (event.code === "Tab") {
        event.preventDefault();
        cycleWeapon(1);
        return;
      }

      const quickSlot = getQuickWeaponSlot(event.code);

      if (quickSlot) {
        event.preventDefault();
        fireWeapon(quickSlot);
      }
    }

    function handleWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) < 1 && Math.abs(event.deltaX) < 1) {
        return;
      }

      event.preventDefault();
      cycleWeapon(event.deltaY + event.deltaX > 0 ? 1 : -1);
    }

    window.addEventListener(
      "codebound:primary-weapon-attack",
      handlePrimaryWeaponAttack,
    );
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener(
        "codebound:primary-weapon-attack",
        handlePrimaryWeaponAttack,
      );
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [cycleWeapon, fireWeapon, handleAttack]);

  useEffect(() => {
    function handleEnemyProjectileHit(event: Event) {
      const { damage } = (event as CustomEvent<{ damage: number }>).detail;
      takeDamage(damage);
    }

    window.addEventListener(
      "codebound:enemy-projectile-hit",
      handleEnemyProjectileHit,
    );

    return () => {
      window.removeEventListener(
        "codebound:enemy-projectile-hit",
        handleEnemyProjectileHit,
      );
    };
  }, [takeDamage]);

  useEffect(() => {
    function handlePlayerProjectileHit(event: Event) {
      const { damage } = (event as CustomEvent<{ damage: number }>).detail;
      applyEnemyDamage(damage);
    }

    window.addEventListener(
      "codebound:player-projectile-hit",
      handlePlayerProjectileHit,
    );

    return () => {
      window.removeEventListener(
        "codebound:player-projectile-hit",
        handlePlayerProjectileHit,
      );
    };
  }, [applyEnemyDamage]);

  useEffect(() => {
    function handlePrimaryTargetUpdated(event: Event) {
      setPrimaryTarget((event as CustomEvent<PrimaryTarget>).detail);
    }

    function handlePrimaryTargetCleared() {
      setPrimaryTarget(null);
    }

    window.addEventListener(
      "codebound:primary-target-updated",
      handlePrimaryTargetUpdated,
    );
    window.addEventListener(
      "codebound:primary-target-cleared",
      handlePrimaryTargetCleared,
    );

    return () => {
      window.removeEventListener(
        "codebound:primary-target-updated",
        handlePrimaryTargetUpdated,
      );
      window.removeEventListener(
        "codebound:primary-target-cleared",
        handlePrimaryTargetCleared,
      );
    };
  }, []);

  useEffect(() => {
    function handleRewards(event: Event){
      const {xpReward} = (event as CustomEvent<{xpReward: number}>).detail;

      // Return if run is over
      if(isPlayerDefeated || remainingRunSeconds <= 0){
        return;
      }

      if(xp+xpReward >= xpGoal){
        setIsUpgradePanelOpen(true);
      }

      defeatEnemy();
      grantXp(xpReward);

      }
    window.addEventListener("codebound:enemy-defeated", handleRewards);

    return () => {
      window.removeEventListener("codebound:enemy-defeated", handleRewards);
    };
  },[defeatEnemy,grantXp,isPlayerDefeated,remainingRunSeconds,xp,xpGoal]);
  
  useEffect(() => {
    if (isPlayerDefeated || remainingRunSeconds <= 0) {
      window.dispatchEvent(new Event("codebound:run-paused"));
    }
  }, [isPlayerDefeated, remainingRunSeconds]);

  const updateWeaponField = (field: WeaponTuningField, value: number) => {
    if (!activeTunableSlot) {
      return;
    }

    updateTunedWeaponField(activeTunableSlot, field, value);
  };

  useEffect(() => {

    function handleVictory () {
      setIsRunVictorious(true);
    }

    window.addEventListener("codebound:run-victory", handleVictory);
    
    return () => {
      window.removeEventListener("codebound:run-victory", handleVictory)
    };

  }, []);

  // WHERE COMPONENT RENDERING BEGINS!
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] text-white">
      <section className="absolute inset-0 z-0 bg-[#071018]">{children}</section>

      {isDevMode ? (
        <DevControls
          isMinimized={isDevToolsMinimized}
          isRunTimerPaused={isRunTimerPaused}
          onMinimizedChange={setIsDevToolsMinimized}
          onRunTimerPause={pauseRunTimer}
          onRunTimerPlay={playRunTimer}
          onRunTimerRestart={restartRunTimer}
          onSkipToMiniboss={skipToMiniboss}
          onSpawnEnemy={spawnRandomEnemy}
          position={devToolsPosition}
          setPosition={setDevToolsPosition}
        />
      ) : null}

      {isWeaponPanelOpen ? (
        <WeaponPanel
          mode={isDevMode ? "dev" : "player"}
          onClose={() => setIsWeaponPanelOpen(false)}
          onCooldownChange={(value) => updateWeaponField("cooldown", value)}
          onDamageChange={(value) => updateWeaponField("damage", value)}
          onRangeChange={(value) => updateWeaponField("range", value)}
          weapon={weapon}
        />
      ) : null}


      {isRunOver ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#071018]/82">
          <section className="pointer-events-auto flex w-[min(420px,calc(100vw-32px))] flex-col items-center border-2 border-red-300/50 bg-black/80 p-6 text-center shadow-[0_0_48px_rgba(248,113,113,0.2)]">
            <div className="text-sm font-bold uppercase tracking-wide text-red-200">
              Run Failed
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              You have been laid off!
            </div>
            <button
              type="button"
              className="mt-5 cursor-pointer border-2 border-cyan-300/70 bg-cyan-500/15 px-5 py-3 font-bold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-400/25"
              onClick={restartRun}
            >
              Restart Run
            </button>
          </section>
        </div>
      ) : null}

      {isRunVictorious ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#071018]/82">
          <section className="pointer-events-auto flex w-[min(420px,calc(100vw-32px))] flex-col items-center border-2 border-red-300/50 bg-black/80 p-6 text-center shadow-[0_0_48px_rgba(248,113,113,0.2)]">
            <div className="text-sm font-bold uppercase tracking-wide text-red-200">
              Successful Run!
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              You have a job offer waiting!
            </div>
            <button
              type="button"
              className="mt-5 cursor-pointer border-2 border-cyan-300/70 bg-cyan-500/15 px-5 py-3 font-bold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-400/25"
              onClick={restartRun}
            >
              Restart Run
            </button>
          </section>
        </div>
      ) : null}

      <GameHud
        primaryTarget={primaryTarget}
        runTimeLabel={runTimeLabel}
        isDevMode={isDevMode}
        isSettingsOpen={isSettingsOpen}
        onDevModeChange={setIsDevMode}
        onWeaponInfoClick={(slot) => {
          selectWeapon(slot);
          setIsWeaponPanelOpen((isOpen) =>
            activeWeaponSlot === slot ? !isOpen : true,
          );
        }}
        onWeaponSelect={selectWeapon}
        onSettingsClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
        selectedSlot={activeWeaponSlot}
        weaponCooldownProgressBySlot={weaponCooldownProgressBySlot}
      />
    </main>
  );
}

function getInitialDevMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("devMode") === "true";
}

function getInitialDevToolsPosition(): DevToolsPosition {
  return getInitialDevMode() ? "left" : "top";
}

function formatRunTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default GameShell;

function getQuickWeaponSlot(code: string): WeaponSlot | null {
  if (code === "KeyQ") {
    return "language";
  }

  if (code === "KeyE") {
    return "sql";
  }

  if (code === "KeyR") {
    return "locked3";
  }

  if (code === "KeyF") {
    return "locked4";
  }

  return null;
}

function getCooldownProgressBySlot(
  readyAtBySlot: Partial<Record<WeaponSlot, number>>,
  now: number,
  weaponsBySlot: Record<TunableWeaponSlot, { cooldown: number }>,
) {
  return Object.fromEntries(
    WEAPON_SLOTS.map((slot) => {
      const tunableSlot = getTunableWeaponSlot(slot);
      const slotWeapon = tunableSlot ? weaponsBySlot[tunableSlot] : null;
      const readyAt = readyAtBySlot[slot] ?? 0;

      if (!slotWeapon || canAttack(readyAt, now)) {
        return [slot, 0];
      }

      return [
        slot,
        Math.min(1, Math.max(0, (readyAt - now) / (slotWeapon.cooldown * 1000))),
      ];
    }),
  ) as Partial<Record<WeaponSlot, number>>;
}

function getTunableWeaponSlot(slot: WeaponSlot): TunableWeaponSlot | null {
  if (slot === "language" || slot === "sql") {
    return slot;
  }

  return null;
}
