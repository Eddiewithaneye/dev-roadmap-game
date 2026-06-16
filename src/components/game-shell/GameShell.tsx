"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { RUN_TUNING } from "@/game/config/run";
import {
  canAttack,
  damageEnemy,
  getCooldownRemaining,
  getNextReadyTime,
  spawnEnemy,
} from "@/game/domain/combat";
import {
  javascriptLanguageWeapon,
  sqlBowWeapon,
} from "@/game/config/weapons";
import type { Weapon } from "@/types/weapon";

import { DevControls } from "./DevControls";
import { GameHud } from "./GameHud";
import { WeaponPanel } from "./WeaponPanel";
import type { DevToolsPosition, WeaponSlot } from "./types";
import { useGameStore } from "@/components/game/stores/useGameStore";

type GameShellProps = {
  children: ReactNode;
};

const INITIAL_HEALTH = 100;
const WEAPON_SLOTS: WeaponSlot[] = ["language", "sql", "locked3", "locked4"];
const weaponBySlot: Partial<Record<WeaponSlot, Weapon>> = {
  language: javascriptLanguageWeapon,
  sql: sqlBowWeapon,
};

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
  
  // UI responsible state hooks
  const [weapon, setWeapon] = useState<Weapon>(javascriptLanguageWeapon);
  const [enemy, setEnemy] = useState(() => spawnEnemy());
  const [readyAtBySlot, setReadyAtBySlot] = useState<
    Partial<Record<WeaponSlot, number>>
  >({});
  const [isAttacking, setIsAttacking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [activeWeaponSlot, setActiveWeaponSlot] =
    useState<WeaponSlot>("language");
  const [isWeaponPanelOpen, setIsWeaponPanelOpen] = useState(false);
  const [isUpgradePanelOpen, setIsUpgradePanelOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [devToolsPosition, setDevToolsPosition] =
    useState<DevToolsPosition>("top");
  const [runStartedAt, setRunStartedAt] = useState(() => Date.now());
  const [isRunVictorious, setIsRunVictorious] = useState(false);
  

  // constants  
  const isPlayerDefeated = health <= 0;
  const activeReadyAt = readyAtBySlot[activeWeaponSlot] ?? 0;
  const weaponReady = canAttack(activeReadyAt, now);
  const cooldownRemaining = getCooldownRemaining(activeReadyAt, now);
  const weaponCooldownProgressBySlot = getCooldownProgressBySlot(
    readyAtBySlot,
    now,
  );

  const remainingRunSeconds = Math.max(
    0,
    RUN_TUNING.survivalGoalSeconds -
      Math.floor((now - runStartedAt) / 1000),
  );

  const isRunOver = !isRunVictorious && (isPlayerDefeated || remainingRunSeconds <= 0);

  const runTimeLabel = formatRunTime(remainingRunSeconds);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  const selectWeapon = useCallback((slot: WeaponSlot) => {
    const nextWeapon = weaponBySlot[slot];

    if (!nextWeapon) {
      setActiveWeaponSlot(slot);
      return;
    }

    setActiveWeaponSlot(slot);
    setWeapon(nextWeapon);
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
    [weapon, xpGoal],
  );

  const fireWeapon = useCallback((slot: WeaponSlot) => {
    if (isPlayerDefeated) {
      return;
    }

    const selectedWeapon = weaponBySlot[slot];

    if (!selectedWeapon) {
      return;
    }

    const attackTime = Date.now();
    const slotReadyAt = readyAtBySlot[slot] ?? 0;

    if (!canAttack(slotReadyAt, attackTime)) {
      return;
    }

    setReadyAtBySlot((current) => ({
      ...current,
      [slot]: getNextReadyTime(selectedWeapon, attackTime),
    }));
    setIsAttacking(true);
    window.dispatchEvent(
      new CustomEvent("codebound:primary-weapon-fired", {
        detail: {
          damage: selectedWeapon.damage,
          effect: selectedWeapon.effect,
          range: selectedWeapon.range,
        },
      }),
    );

    window.setTimeout(() => setIsAttacking(false), 250);
  }, [applyEnemyDamage, isPlayerDefeated, readyAtBySlot]);

  const handleAttack = useCallback(() => {
    fireWeapon(activeWeaponSlot);
  }, [activeWeaponSlot, fireWeapon]);

  const restartRun = useCallback(() => {
    resetRun();
    setEnemy(spawnEnemy());
    setReadyAtBySlot({});
    setIsAttacking(false);
    setRunStartedAt(Date.now());
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

  const updateWeaponField = (
    field: "damage" | "cooldown" | "range",
    value: number,
  ) => {
    setWeapon((current) => ({ ...current, [field]: value }));
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
          position={devToolsPosition}
          setPosition={setDevToolsPosition}
        />
      ) : null}

      {isWeaponPanelOpen ? (
        <WeaponPanel
          cooldownRemaining={cooldownRemaining}
          isReady={weaponReady}
          mode={isDevMode ? "dev" : "player"}
          onClose={() => setIsWeaponPanelOpen(false)}
          onAttack={handleAttack}
          onCooldownChange={(value) => updateWeaponField("cooldown", value)}
          onDamageChange={(value) => updateWeaponField("damage", value)}
          onRangeChange={(value) => updateWeaponField("range", value)}
          weapon={weapon}
        />
      ) : null}

      {isAttacking ? (
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-20 -translate-x-1/2">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan-300/30 blur-xl animate-ping" />
            <div className="relative h-12 w-12 rounded-full bg-cyan-200/90 shadow-[0_0_30px_rgba(56,189,248,0.85)]" />
          </div>
        </div>
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
        enemy = {enemy}
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
) {
  return Object.fromEntries(
    WEAPON_SLOTS.map((slot) => {
      const slotWeapon = weaponBySlot[slot];
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
