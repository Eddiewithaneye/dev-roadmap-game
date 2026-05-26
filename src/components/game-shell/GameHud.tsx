import { AbilitySlot } from "./AbilitySlot";
import { EnemyPanel } from "./EnemyPanel";
import { PlayerCard } from "./PlayerCard";
import { ResourceStat } from "./ResourceStat";
import { XpBar } from "./XpBar";
import type { GameHudProps } from "./types";

export function GameHud({
  health,
  codeFragments,
  cred,
  xp,
  enemies,
  level,
  maxHealth,
  xpGoal,
  maxEnemies,
  enemy,
  weapon,
  selectedSlot,
  onLanguageSlotClick,
}: GameHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <section className="absolute left-0 right-0 top-0 flex h-20 items-start justify-between border-b-4 border-[#05242d] bg-[#071018]/90">
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

        <div className="absolute left-1/2 top-0 flex h-24 w-72 -translate-x-1/2 flex-col items-center justify-center bg-[#0a4759] [clip-path:polygon(0_0,100%_0,100%_70%,50%_100%,0_70%)]">
          <div className="text-3xl font-bold tracking-wide">08:42</div>
          <div className="text-sm font-bold text-cyan-200">Survive!</div>
        </div>

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

      <section className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-6">
        <div className="flex gap-3">
          <PlayerCard health={health} level={level} maxHealth={maxHealth} />
          <PlayerCard
            health={Math.max(0, health - 34)}
            level={level}
            maxHealth={278}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            <AbilitySlot
              active={selectedSlot === "language"}
              icon={weapon.icon}
              imageSrc={weapon.imageSrc}
              label="Lv. 3"
              onClick={onLanguageSlotClick}
            />
            <AbilitySlot icon="⌁" label="Lv. 3" />
            <AbilitySlot icon="" label="Lv. 6" locked />
            <AbilitySlot icon="" label="Lv. 10" locked />
          </div>
          <XpBar level={level} xp={xp} xpGoal={xpGoal} />
        </div>

        <EnemyPanel enemy={enemy} enemies={enemies} maxEnemies={maxEnemies} />
      </section>
    </div>
  );
}
