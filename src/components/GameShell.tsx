"use client";

import { useEffect, useState } from "react";
import WeaponPanel from "@/components/WeaponPanel";
import EnemyPanel from "@/components/EnemyPanel";
import { attackEnemy, canAttack, getCooldownRemaining, spawnBoss, type Enemy } from "@/lib/game/combat";
import { javascriptLanguageWeapon } from "@/lib/game/weapons";
import type { Weapon } from "@/types/weapon";

type ResourceStatProps = {
  icon: string;
  label: string;
  value: number;
};

type PlayerCardProps = {
  health: number;
  level: number;
  maxHealth: number;
};

type AbilitySlotProps = {
  icon: string;
  imageSrc?: string;
  label: string;
  locked?: boolean;
  active?: boolean;
  onClick?: () => void;
};

type XpBarProps = {
  level: number;
  xp: number;
  xpGoal: number;
};

// This reusable component displays one top-bar resource like fragments or cred.
function ResourceStat({ icon, label, value }: ResourceStatProps) {
  return (
    <div className="flex items-center gap-3 border-l border-cyan-300/20 px-5">
      {/* The icon is a temporary text symbol until we replace it with art. */}
      <span className="text-2xl text-cyan-300">{icon}</span>
      <div>
        <div className="text-2xl font-bold leading-6 text-white">
          {value.toLocaleString()}
        </div>
        <div className="text-xs font-bold text-cyan-300">{label}</div>
      </div>
    </div>
  );
}

// This card mirrors the lower-left player panels in the reference HUD.
function PlayerCard({ health, level, maxHealth }: PlayerCardProps) {
  const healthPercent = (health / maxHealth) * 100;

  return (
    <div className="flex w-52 items-end gap-2 border-2 border-cyan-300/30 bg-black/70 p-2">
      {/* This square is a temporary portrait placeholder. */}
      <div className="flex h-16 w-16 items-center justify-center border-2 border-cyan-300/40 bg-[#102432] text-3xl">
        ◉
      </div>

      <div className="flex-1">
        {/* Health number row. */}
        <div className="mb-1 flex items-center justify-between bg-green-700 px-2 text-sm font-bold">
          <span>{health}</span>
          <span>/ {maxHealth}</span>
        </div>

        {/* Health bar track and fill. */}
        <div className="mb-1 h-3 overflow-hidden bg-[#061217]">
          <div
            className="h-full bg-green-400"
            style={{ width: `${healthPercent}%` }}
          />
        </div>

        {/* Level badge and secondary energy-style bar. */}
        <div className="flex items-center gap-2">
          <div className="border border-cyan-300/40 bg-black px-2 text-sm font-bold">
            {level}
          </div>
          <div className="h-3 flex-1 overflow-hidden bg-[#061217]">
            <div className="h-full w-2/3 bg-cyan-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Ability slots form the bottom-center action bar.
function AbilitySlot({ icon, imageSrc, label, locked = false, active = false, onClick }: AbilitySlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`pointer-events-auto flex h-24 w-24 flex-col items-center justify-center border-2 bg-black/75 transition ${
        active ? "border-cyan-300 bg-cyan-500/10 shadow-[0_0_30px_rgba(56,189,248,0.25)]" : "border-cyan-300/30"
      } ${locked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-cyan-200"}`}
    >
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#081a23] text-3xl">
        {locked ? (
          <span className="text-zinc-500">🔒</span>
        ) : imageSrc ? (
          <img src={imageSrc} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="text-cyan-300">{icon}</span>
        )}
      </div>
      <div className="mt-2 text-sm font-bold text-white">{label}</div>
    </button>
  );
}

// XP belongs near the bottom because level progression is part of the player state.
function XpBar({ level, xp, xpGoal }: XpBarProps) {
  const xpPercent = Math.min(100, (xp / xpGoal) * 100);

  return (
    <div className="flex w-[520px] items-center gap-3">
      <div className="text-lg font-bold">Lv. {level}</div>
      <div className="h-4 flex-1 overflow-hidden border border-cyan-300/40 bg-black/70">
        <div
          className="h-full bg-cyan-300"
          style={{ width: `${xpPercent}%` }}
        />
      </div>
      <div className="font-bold text-cyan-200">
        {xp.toLocaleString()} / {xpGoal.toLocaleString()}
      </div>
    </div>
  );
}

export default function GameShell() {
  // These state values are temporary game data until Phaser sends real updates.
  const [health, setHealth] = useState(100);
  const [codeFragments, setCodeFragments] = useState(1248);
  const [cred, setCred] = useState(3560);
  const [xp, setXp] = useState(1250);
  const [enemies, setEnemies] = useState(5);
  const [weapon, setWeapon] = useState<Weapon>(javascriptLanguageWeapon);
  const [enemy, setEnemy] = useState<Enemy>(spawnBoss());
  const [readyAt, setReadyAt] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [selectedSlot, setSelectedSlot] = useState<"language" | null>(null);
  const level = 12;
  const maxHealth = 312;
  const xpGoal = 2000;
  const maxEnemies = 5;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  const weaponReady = canAttack(readyAt, now);
  const cooldownRemaining = getCooldownRemaining(readyAt, now);
  const isWeaponPanelOpen = selectedSlot === "language";

  const handleAttack = () => {
    if (!weaponReady) return;

    const result = attackEnemy(weapon, enemy, now);
    setEnemy((current) => ({ ...current, health: result.enemyHealth }));
    setReadyAt(result.newCooldownReadyAt);
    setIsAttacking(true);

    if (result.isEnemyDefeated) {
      setTimeout(() => {
        setEnemies((count) => Math.max(0, count - 1));
        setEnemy(spawnBoss());
      }, 600);
    }

    window.setTimeout(() => setIsAttacking(false), 250);
  };

  const toggleLanguageSlot = () => {
    setSelectedSlot((current) => (current === "language" ? null : "language"));
  };

  const updateWeaponField = (field: "damage" | "cooldown" | "range", value: number) => {
    setWeapon((current) => ({ ...current, [field]: value }));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] text-white">
      {/* This is a temporary game scene background so the HUD is readable over a game-like space. */}
      <section className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,#143b4a_0%,#071018_65%)]">
        <div className="flex gap-3">
          {/* These buttons simulate game events while we do not have Phaser wired in yet. */}
          <button
            className="cursor-pointer hover:border-cyan-200 border border-cyan-300/40 bg-black/60 px-4 py-2"
            onClick={() => setHealth(Math.max(0, health - 10))}
          >
            Take Damage
          </button>
          <button
            className="cursor-pointer hover:border-cyan-200 border border-cyan-300/40 bg-black/60 px-4 py-2"
            onClick={() => setCodeFragments(codeFragments + 100)}
          >
            Add Fragments
          </button>
          <button
            className="cursor-pointer hover:border-cyan-200 border border-cyan-300/40 bg-black/60 px-4 py-2"
            onClick={() => setCred(cred + 50)}
          >
            Add Cred
          </button>
          <button
            className="cursor-pointer hover:border-cyan-200 border border-cyan-300/40 bg-black/60 px-4 py-2"
            onClick={() => setXp(Math.min(xpGoal, xp + 125))}
          >
            Add XP
          </button>
          <button
            className="cursor-pointer hover:border-cyan-200 border border-cyan-300/40 bg-black/60 px-4 py-2"
            onClick={() => setEnemies(Math.max(0, enemies - 1))}
          >
            Defeat Enemy
          </button>
        </div>

        {isWeaponPanelOpen && (
          <WeaponPanel
            weapon={weapon}
            isReady={weaponReady}
            cooldownRemaining={cooldownRemaining}
            onAttack={handleAttack}
            onDamageChange={(value) => updateWeaponField("damage", value)}
            onCooldownChange={(value) => updateWeaponField("cooldown", value)}
            onRangeChange={(value) => updateWeaponField("range", value)}
          />
        )}

        {isAttacking && (
          <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-300/30 blur-xl animate-ping" />
              <div className="relative h-12 w-12 rounded-full bg-cyan-200/90 shadow-[0_0_30px_rgba(56,189,248,0.85)]" />
            </div>
          </div>
        )}
      </section>

      {/* The HUD layer sits over the scene and does not block game input. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Top HUD bar: left and right groups flow normally, while the timer is pinned to the true center. */}
        <section className="absolute left-0 right-0 top-0 flex h-20 items-start justify-between border-b-4 border-[#05242d] bg-[#071018]/90">
          {/* Left group: game area identity. */}
          <div className="flex w-[38%] items-center gap-3 px-6 py-3">
            <div className="border-2 border-cyan-300/50 bg-[#102432] px-3 py-2 text-2xl">
              ◆
            </div>
            <div>
              <div className="text-xl font-bold uppercase tracking-wide">
                Code Campus
              </div>
              <div className="text-sm font-bold text-cyan-300">
                Lecture Halls Ruins
              </div>
            </div>
          </div>

          {/* Center group: absolute positioning keeps the timer centered in the screen, not centered between uneven side content. */}
          <div className="absolute left-1/2 top-0 flex h-24 w-72 -translate-x-1/2 flex-col items-center justify-center bg-[#0a4759] [clip-path:polygon(0_0,100%_0,100%_70%,50%_100%,0_70%)]">
            <div className="text-3xl font-bold tracking-wide">08:42</div>
            <div className="text-sm font-bold text-cyan-200">Survive!</div>
          </div>

          {/* Right group: top resources only. Level/XP will move to the bottom HUD later. */}
          <div className="flex w-[38%] items-center justify-end px-6 py-3">
            <ResourceStat
              icon="✦"
              label="Code Fragments"
              value={codeFragments}
            />
            <ResourceStat icon="◎" label="Cred" value={cred} />
            <div className="ml-5 border-2 border-cyan-300/40 bg-black/40 px-3 py-2 text-2xl">
              ⚙
            </div>
          </div>
        </section>

        {/* Bottom HUD: player card, ability slots, XP, and enemy objective bar. */}
        <section className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-6">
          {/* Left group: player status cards. */}
          <div className="flex gap-3">
            <PlayerCard health={health} level={level} maxHealth={maxHealth} />
            <PlayerCard
              health={Math.max(0, health - 34)}
              level={level}
              maxHealth={278}
            />
          </div>

          {/* Center group: ability slots stacked above the XP bar. */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
                  <AbilitySlot
                icon={weapon.icon}
                imageSrc={weapon.imageSrc}
                label="Lv. 3"
                active={selectedSlot === "language"}
                onClick={toggleLanguageSlot}
              />
              <AbilitySlot icon="⌁" label="Lv. 3" />
              <AbilitySlot icon="" label="Lv. 6" locked />
              <AbilitySlot icon="" label="Lv. 10" locked />
            </div>
            <XpBar level={level} xp={xp} xpGoal={xpGoal} />
          </div>

          {/* Right group: current enemy objective. */}
          <EnemyPanel enemy={enemy} enemies={enemies} maxEnemies={maxEnemies} />
        </section>
      </div>
    </main>
  );
}
