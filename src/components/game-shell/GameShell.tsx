"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

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
import { clampHealth } from "@/game/domain/health";
import type { Weapon } from "@/types/weapon";

import { DevControls } from "./DevControls";
import { GameHud } from "./GameHud";
import { WeaponPanel } from "./WeaponPanel";
import type { DevToolsPosition } from "./types";

type GameShellProps = {
  children: ReactNode;
};

const INITIAL_HEALTH = 100;

export function GameShell({ children }: GameShellProps) {
  // These state values are temporary game data until Phaser sends real updates.
  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [codeFragments, setCodeFragments] = useState(1248);
  const [cred, setCred] = useState(3560);
  const [xp, setXp] = useState(1250);
  const [enemies, setEnemies] = useState(5);
  const [weapon, setWeapon] = useState<Weapon>(javascriptLanguageWeapon);
  const [enemy, setEnemy] = useState(() => spawnEnemy());
  const [readyAt, setReadyAt] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [activeWeaponSlot, setActiveWeaponSlot] = useState<"language" | "sql">(
    "language",
  );
  const [isWeaponPanelOpen, setIsWeaponPanelOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [devToolsPosition, setDevToolsPosition] =
    useState<DevToolsPosition>("top");
  const level = 12;
  const maxHealth = 312;
  const xpGoal = 2000;
  const maxEnemies = 5;
  const weaponReady = canAttack(readyAt, now);
  const isPlayerDefeated = health <= 0;
  const cooldownRemaining = getCooldownRemaining(readyAt, now);
  const weaponCooldownProgress = weaponReady
    ? 0
    : Math.min(1, Math.max(0, (readyAt - now) / (weapon.cooldown * 1000)));

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  const applyEnemyDamage = useCallback(
    (damage: number) => {
      setEnemy((currentEnemy) => {
        const nextEnemy = damageEnemy(
          { ...weapon, damage },
          currentEnemy,
        );

        if (nextEnemy.health === 0) {
          window.setTimeout(() => {
            setEnemies((count) => Math.max(0, count - 1));
            setXp((currentXp) =>
              Math.min(xpGoal, currentXp + currentEnemy.xpReward),
            );
            setEnemy(spawnEnemy());
          }, 600);
        }

        return nextEnemy;
      });
    },
    [weapon, xpGoal],
  );

  const handleAttack = useCallback(() => {
    if (isPlayerDefeated) {
      return;
    }

    const attackTime = Date.now();

    if (!canAttack(readyAt, attackTime)) {
      return;
    }

    setReadyAt(getNextReadyTime(weapon, attackTime));
    setIsAttacking(true);
    window.dispatchEvent(
      new CustomEvent("codebound:primary-weapon-fired", {
        detail: {
          damage: weapon.damage,
          effect: weapon.effect,
          range: weapon.range,
        },
      }),
    );

    if (weapon.effect === "chain-spark") {
      applyEnemyDamage(weapon.damage);
    }

    window.setTimeout(() => setIsAttacking(false), 250);
  }, [applyEnemyDamage, isPlayerDefeated, readyAt, weapon]);

  const restartRun = useCallback(() => {
    setHealth(INITIAL_HEALTH);
    setCodeFragments(1248);
    setCred(3560);
    setXp(1250);
    setEnemies(maxEnemies);
    setEnemy(spawnEnemy());
    setReadyAt(0);
    setIsAttacking(false);
    window.dispatchEvent(new Event("codebound:run-restarted"));
  }, [maxEnemies]);

  useEffect(() => {
    function handlePrimaryWeaponAttack() {
      handleAttack();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat) {
        return;
      }

      event.preventDefault();
      handleAttack();
    }

    window.addEventListener(
      "codebound:primary-weapon-attack",
      handlePrimaryWeaponAttack,
    );
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "codebound:primary-weapon-attack",
        handlePrimaryWeaponAttack,
      );
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleAttack]);

  useEffect(() => {
    function handleEnemyProjectileHit(event: Event) {
      const { damage } = (event as CustomEvent<{ damage: number }>).detail;
      setHealth((currentHealth) =>
        clampHealth(currentHealth - damage, maxHealth),
      );
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
  }, [maxHealth]);

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
    if (isPlayerDefeated) {
      window.dispatchEvent(new Event("codebound:run-paused"));
    }
  }, [isPlayerDefeated]);

  const updateWeaponField = (
    field: "damage" | "cooldown" | "range",
    value: number,
  ) => {
    setWeapon((current) => ({ ...current, [field]: value }));
  };

  const selectWeapon = (slot: "language" | "sql") => {
    setActiveWeaponSlot(slot);
    setWeapon(slot === "sql" ? sqlBowWeapon : javascriptLanguageWeapon);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] text-white">
      <section className="absolute inset-0 z-0 bg-[#071018]">{children}</section>

      {isDevMode ? (
        <DevControls
          position={devToolsPosition}
          enemies={enemies}
          health={health}
          setCodeFragments={setCodeFragments}
          setCred={setCred}
          setEnemies={setEnemies}
          setHealth={setHealth}
          setPosition={setDevToolsPosition}
          setXp={setXp}
          xp={xp}
          xpGoal={xpGoal}
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

      {isPlayerDefeated ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#071018]/82">
          <section className="pointer-events-auto flex w-[min(420px,calc(100vw-32px))] flex-col items-center border-2 border-red-300/50 bg-black/80 p-6 text-center shadow-[0_0_48px_rgba(248,113,113,0.2)]">
            <div className="text-sm font-bold uppercase tracking-wide text-red-200">
              Run Failed
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              Player knocked out
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
        codeFragments={codeFragments}
        cred={cred}
        enemy={enemy}
        enemies={enemies}
        health={health}
        isDevMode={isDevMode}
        isSettingsOpen={isSettingsOpen}
        level={level}
        maxEnemies={maxEnemies}
        maxHealth={maxHealth}
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
        weaponCooldownProgress={weaponCooldownProgress}
        xp={xp}
        xpGoal={xpGoal}
      />
    </main>
  );
}

export default GameShell;
