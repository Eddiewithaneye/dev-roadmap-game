"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  attackEnemy,
  canAttack,
  damageEnemy,
  getCooldownRemaining,
  spawnEnemy,
} from "@/game/domain/combat";
import { javascriptLanguageWeapon } from "@/game/config/weapons";
import type { Weapon } from "@/types/weapon";

import { DevControls } from "./DevControls";
import { GameHud } from "./GameHud";
import { WeaponPanel } from "./WeaponPanel";
import type { DevToolsPosition } from "./types";

type GameShellProps = {
  children: ReactNode;
};

export function GameShell({ children }: GameShellProps) {
  // These state values are temporary game data until Phaser sends real updates.
  const [health, setHealth] = useState(100);
  const [codeFragments, setCodeFragments] = useState(1248);
  const [cred, setCred] = useState(3560);
  const [xp, setXp] = useState(1250);
  const [enemies, setEnemies] = useState(5);
  const [weapon, setWeapon] = useState<Weapon>(javascriptLanguageWeapon);
  const [enemy, setEnemy] = useState(() => spawnEnemy());
  const [readyAt, setReadyAt] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [selectedSlot, setSelectedSlot] = useState<"language" | null>(null);
  const [isDevMode, setIsDevMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [devToolsPosition, setDevToolsPosition] =
    useState<DevToolsPosition>("top");
  const level = 12;
  const maxHealth = 312;
  const xpGoal = 2000;
  const maxEnemies = 5;
  const weaponReady = canAttack(readyAt, now);
  const cooldownRemaining = getCooldownRemaining(readyAt, now);
  const weaponCooldownProgress = weaponReady
    ? 0
    : Math.min(1, Math.max(0, (readyAt - now) / (weapon.cooldown * 1000)));
  const isWeaponPanelOpen = selectedSlot === "language";

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  const handleAttack = () => {
    const attackTime = Date.now();

    if (!canAttack(readyAt, attackTime)) {
      return;
    }

    const attackResult = attackEnemy(weapon, enemy, attackTime);
    const nextEnemy = damageEnemy(weapon, enemy);

    setEnemy(nextEnemy);
    setReadyAt(attackResult.newCooldownReadyAt);
    setIsAttacking(true);
    window.dispatchEvent(new Event("codebound:primary-weapon-fired"));

    if (nextEnemy.health === 0) {
      window.setTimeout(() => {
        setEnemies((count) => Math.max(0, count - 1));
        setXp((currentXp) =>
          Math.min(xpGoal, currentXp + enemy.xpReward),
        );
        setEnemy(spawnEnemy());
      }, 600);
    }

    window.setTimeout(() => setIsAttacking(false), 250);
  };

  useEffect(() => {
    function handlePrimaryWeaponAttack() {
      handleAttack();
    }

    window.addEventListener(
      "codebound:primary-weapon-attack",
      handlePrimaryWeaponAttack,
    );

    return () => {
      window.removeEventListener(
        "codebound:primary-weapon-attack",
        handlePrimaryWeaponAttack,
      );
    };
  }, [handleAttack]);

  const updateWeaponField = (
    field: "damage" | "cooldown" | "range",
    value: number,
  ) => {
    setWeapon((current) => ({ ...current, [field]: value }));
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
        onLanguageSlotClick={() =>
          setSelectedSlot((current) =>
            current === "language" ? null : "language",
          )
        }
        onSettingsClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
        selectedSlot={selectedSlot}
        weapon={weapon}
        weaponCooldownProgress={weaponCooldownProgress}
        xp={xp}
        xpGoal={xpGoal}
      />
    </main>
  );
}

export default GameShell;
