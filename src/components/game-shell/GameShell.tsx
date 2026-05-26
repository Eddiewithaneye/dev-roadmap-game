"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  attackEnemy,
  canAttack,
  getCooldownRemaining,
  spawnEnemy,
} from "@/game/domain/combat";
import { javascriptLanguageWeapon } from "@/game/config/weapons";
import type { Weapon } from "@/types/weapon";

import { DevControls } from "./DevControls";
import { GameHud } from "./GameHud";
import { WeaponPanel } from "./WeaponPanel";
import type { WeaponPanelMode } from "./types";

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
  const [weaponPanelMode, setWeaponPanelMode] =
    useState<WeaponPanelMode>("player");
  const level = 12;
  const maxHealth = 312;
  const xpGoal = 2000;
  const maxEnemies = 5;
  const weaponReady = canAttack(readyAt, now);
  const cooldownRemaining = getCooldownRemaining(readyAt, now);
  const isWeaponPanelOpen = selectedSlot === "language";

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  const handleAttack = () => {
    if (!weaponReady) {
      return;
    }

    const result = attackEnemy(weapon, enemy, now);
    setEnemy((current) => ({ ...current, health: result.enemyHealth }));
    setReadyAt(result.newCooldownReadyAt);
    setIsAttacking(true);

    if (result.isEnemyDefeated) {
      window.setTimeout(() => {
        setEnemies((count) => Math.max(0, count - 1));
        setXp((currentXp) => Math.min(xpGoal, currentXp + result.xpReward));
        setEnemy(spawnEnemy());
      }, 600);
    }

    window.setTimeout(() => setIsAttacking(false), 250);
  };

  const updateWeaponField = (
    field: "damage" | "cooldown" | "range",
    value: number,
  ) => {
    setWeapon((current) => ({ ...current, [field]: value }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] text-white">
      <section className="absolute inset-0 z-0 bg-[#071018]">{children}</section>

      <section className="pointer-events-auto absolute left-1/2 top-24 z-20 -translate-x-1/2">
        <DevControls
          enemies={enemies}
          health={health}
          setCodeFragments={setCodeFragments}
          setCred={setCred}
          setEnemies={setEnemies}
          setHealth={setHealth}
          setWeaponPanelMode={setWeaponPanelMode}
          setXp={setXp}
          weaponPanelMode={weaponPanelMode}
          xp={xp}
          xpGoal={xpGoal}
        />
      </section>

      {isWeaponPanelOpen ? (
        <WeaponPanel
          cooldownRemaining={cooldownRemaining}
          isReady={weaponReady}
          mode={weaponPanelMode}
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
        level={level}
        maxEnemies={maxEnemies}
        maxHealth={maxHealth}
        onLanguageSlotClick={() =>
          setSelectedSlot((current) =>
            current === "language" ? null : "language",
          )
        }
        selectedSlot={selectedSlot}
        weapon={weapon}
        xp={xp}
        xpGoal={xpGoal}
      />
    </main>
  );
}

export default GameShell;
