"use client";

import { useState } from "react";

//import { DevControls } from "./DevControls";
import { GameHud } from "./GameHud";
import { GameScenePlaceholder } from "./GameScenePlaceholder";

export function GameShell() {
  // These state values are temporary game data until Phaser sends real updates.
  const [health, setHealth] = useState(100);
  const [codeFragments, setCodeFragments] = useState(1248);
  const [cred, setCred] = useState(3560);
  const [xp, setXp] = useState(1250);
  const [enemies, setEnemies] = useState(5);
  const level = 12;
  const maxHealth = 312;
  const xpGoal = 2000;
  const maxEnemies = 5;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071018] text-white">
      <GameScenePlaceholder />

      {/*
      <div className="absolute inset-0 flex items-center justify-center">
        <DevControls
          enemies={enemies}
          health={health}
          setCodeFragments={setCodeFragments}
          setCred={setCred}
          setEnemies={setEnemies}
          setHealth={setHealth}
          setXp={setXp}
          xp={xp}
          xpGoal={xpGoal}
        />
      </div>
      */}
            
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
