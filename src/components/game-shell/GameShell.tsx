"use client";

import { useState } from "react";

import { GameArena } from "./GameArena";
import { GameHud } from "./GameHud";

export function GameShell() {
  // These state values are temporary game data until Phaser sends real updates.
  const [health] = useState(100);
  const [codeFragments] = useState(1248);
  const [cred] = useState(3560);
  const [xp] = useState(1250);
  const [enemies] = useState(5);
  const level = 12;
  const maxHealth = 312;
  const xpGoal = 2000;
  const maxEnemies = 5;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] text-white">
      <GameArena />

      <GameHud
        codeFragments={codeFragments}
        cred={cred}
        enemies={enemies}
        health={health}
        level={level}
        maxEnemies={maxEnemies}
        maxHealth={maxHealth}
        xp={xp}
        xpGoal={xpGoal}
      />
    </main>
  );
}

export default GameShell;
