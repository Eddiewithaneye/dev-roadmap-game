import Image from "next/image";

import { AbilitySlot } from "./AbilitySlot";
import { EnemyPanel } from "./EnemyPanel";
import { PlayerCard } from "./PlayerCard";
import { ResourceStat } from "./ResourceStat";
import { SettingsMenu } from "./SettingsMenu";
import { XpBar } from "./XpBar";
import type { GameHudProps } from "./types";
import { useGameStore } from "../game/stores/useGameStore";

export function GameHud({
  runTimeLabel,
  isWaterfallMode,
  isEntryTransitionActive,
  inputMode,
  primaryTarget,
  selectedSlot,
  weaponCooldownProgressBySlot,
  isDevMode,
  isSettingsOpen,
  onWeaponInfoClick,
  onWeaponSelect,
  onSettingsClick,
  onDevModeChange,
}: GameHudProps) {
  const xpGoal = useGameStore((state) => state.xpGoal);
  const xp = useGameStore((state) => state.xp);
  const maxHealth = useGameStore((state) => state.maxHealth);
  const level = useGameStore((state) => state.level);
  const health = useGameStore((state) => state.health);
  const cred = useGameStore((state) => state.cred);
  const codeFragments = useGameStore((state) => state.codeFragments);

  const timerHeading = isWaterfallMode
    ? "Waterfall - Endless Mode"
    : "Time left in sprint";

  const isTouchLandscape = inputMode === "touch-landscape";
  const abilitySlotSize = isTouchLandscape ? "mobile" : "default";
  const hudDensity = isTouchLandscape ? "compact" : "default";

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <section
        className={`game-hud-topbar absolute left-0 right-0 top-0 flex items-start justify-between border-b-4 border-[#05242d] bg-[#071018]/90 ${
          isTouchLandscape ? "h-8" : "h-20"
        }`}
      >
        <div
          className={`flex items-start pl-2 ${
            isTouchLandscape
              ? "w-[42%] gap-1 py-0.5 pr-1"
              : "w-[38%] gap-4 py-2 pr-6"
          }`}
        >
          <Image
            alt="Codebound"
            className={`h-auto shrink-0 transition-opacity duration-150 ${
              isTouchLandscape
                ? "-mt-1 w-28"
                : "-mt-3 w-[228px] sm:-mt-4 sm:w-60 md:w-72"
            } ${isEntryTransitionActive ? "opacity-0" : "opacity-100"}`}
            height={1344}
            priority
            src="/images/codebound-logo.png"
            width={3168}
          />

          <div
            className={`mt-1 border-2 border-cyan-300/50 bg-[#102432] ${
              isTouchLandscape ? "px-1 py-0 text-xs" : "px-3 py-2 text-2xl"
            }`}
          >
            ◆
          </div>

          <div className={isTouchLandscape ? "pt-0.5" : "pt-1"}>
            <div
              className={`font-bold uppercase tracking-wide ${
                isTouchLandscape ? "text-[9px] leading-3" : "text-xl"
              }`}
            >
              Code Campus
            </div>
            <div
              className={`font-bold text-cyan-300 ${
                isTouchLandscape ? "text-[8px] leading-3" : "text-sm"
              }`}
            >
              Lecture Halls Ruins
            </div>
          </div>
        </div>

        <div
          className={`game-hud-timer-banner absolute left-1/2 top-0 flex  flex-col items-center justify-start bg-[#0a4759] [clip-path:polygon(0_0,100%_0,100%_72%,50%_100%,0_72%)] ${
            isTouchLandscape
              ? "min-h-12 w-40 px-2 pt-1"
              : "min-h-28 w-80 px-4 pt-3"
          }`}
        >
          <div
            className={`font-bold uppercase tracking-wide text-cyan-100 ${
              isTouchLandscape ? "text-[8px] leading-3" : "text-sm"
            }`}
          >
            {timerHeading}
          </div>

          <div
            className={`mt-1 font-black tracking-wide ${
              isTouchLandscape ? "text-lg leading-5" : "text-4xl"
            }`}
          >
            {runTimeLabel}
          </div>

          {isWaterfallMode ? (
            <div
              className={`mt-1 rounded-full border border-cyan-200/70 bg-black/25 font-black leading-none text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.18)] ${
                isTouchLandscape ? "px-2 py-0 text-sm" : "px-4 py-0.5 text-2xl"
              }`}
            >
              ∞
            </div>
          ) : null}
        </div>

        <div
          className={`flex items-center justify-end ${
            isTouchLandscape ? "w-[38%] px-2 py-1" : "w-[38%] px-6 py-3"
          }`}
        >
          <ResourceStat
            icon="✦"
            label="Code Fragments"
            value={codeFragments}
            density={hudDensity}
          />
          <ResourceStat
            icon="◎"
            label="Cred"
            value={cred}
            density={hudDensity}
          />

          <button
            type="button"
            className={`pointer-events-auto cursor-pointer border-2 border-cyan-300/40 bg-black/40 transition hover:border-cyan-200 hover:bg-cyan-500/10 ${
              isTouchLandscape
                ? "ml-2 px-1 py-0 text-sm"
                : "ml-5 px-3 py-2 text-2xl"
            }`}
            onClick={onSettingsClick}
            aria-expanded={isSettingsOpen}
            aria-label="Open settings"
          >
            ⚙
          </button>
        </div>
      </section>

      {isSettingsOpen ? (
        <SettingsMenu
          isDevMode={isDevMode}
          onDevModeChange={onDevModeChange}
        />
      ) : null}

      <section
        className={`absolute ${
          isTouchLandscape
            ? "bottom-2 left-2 right-2 flex items-end justify-between gap-2"
            : "bottom-6 left-6 right-6 flex items-end justify-between gap-6"
        }`}
      >
        <div className="game-hud-hero-panel flex gap-3">
          <PlayerCard
            density={hudDensity}
            health={health}
            level={level}
            maxHealth={maxHealth}
          />
        </div>

        {!isTouchLandscape ? (
          <div className="flex flex-col items-center gap-3">
            <div className="game-hud-weapons flex gap-3">
              <AbilitySlot
                active={selectedSlot === "language"}
                icon="JS"
                imageSrc="/images/Event_Spark_Wand.png"
                label="Lv. 3"
                shortcutLabel="Q"
                cooldownProgress={weaponCooldownProgressBySlot.language ?? 0}
                onClick={() => onWeaponSelect("language")}
                onKeyDown={preventSpaceButtonClick}
                onInfoClick={() => onWeaponInfoClick("language")}
                size={abilitySlotSize}
              />

              <AbilitySlot
                active={selectedSlot === "sql"}
                icon="SQL"
                imageSrc="/images/sql-bow-placeholder.svg"
                label="Lv. 3"
                shortcutLabel="E"
                cooldownProgress={weaponCooldownProgressBySlot.sql ?? 0}
                onClick={() => onWeaponSelect("sql")}
                onKeyDown={preventSpaceButtonClick}
                onInfoClick={() => onWeaponInfoClick("sql")}
                size={abilitySlotSize}
              />

              <AbilitySlot
                active={selectedSlot === "locked3"}
                icon=""
                label="Lv. 6"
                shortcutLabel="R"
                locked
                size={abilitySlotSize}
              />

              <AbilitySlot
                active={selectedSlot === "locked4"}
                icon=""
                label="Lv. 10"
                shortcutLabel="F"
                locked
                size={abilitySlotSize}
              />
            </div>

            <div className="game-hud-xp">
              <XpBar
                density={hudDensity}
                level={level}
                xp={xp}
                xpGoal={xpGoal}
              />
            </div>
          </div>
        ) : (
          <div className="game-hud-xp fixed bottom-2 left-1/2 z-30 -translate-x-1/2">
            <XpBar
              density={hudDensity}
              level={level}
              xp={xp}
              xpGoal={xpGoal}
            />
          </div>
        )}

        {!isTouchLandscape && primaryTarget ? (
          <EnemyPanel primaryTarget={primaryTarget} />
        ) : (
          <div className={isTouchLandscape ? "w-36" : "w-[520px]"} />
        )}
      </section>

      {isTouchLandscape ? (
        <div className="game-hud-weapons pointer-events-auto fixed right-[max(8px,env(safe-area-inset-right))] top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-2">
          <AbilitySlot
            active={false}
            icon="JS"
            imageSrc="/images/Event_Spark_Wand.png"
            label="Lv. 3"
            cooldownProgress={weaponCooldownProgressBySlot.language ?? 0}
            onClick={() => onWeaponSelect("language")}
            onKeyDown={preventSpaceButtonClick}
            // onInfoClick={() => onWeaponInfoClick("language")}
            size={abilitySlotSize}
          />

          <AbilitySlot
            active={false}
            icon="SQL"
            imageSrc="/images/sql-bow-placeholder.svg"
            label="Lv. 3"
            cooldownProgress={weaponCooldownProgressBySlot.sql ?? 0}
            onClick={() => onWeaponSelect("sql")}
            onKeyDown={preventSpaceButtonClick}
            // onInfoClick={() => onWeaponInfoClick("sql")}
            size={abilitySlotSize}
          />
        </div>
      ) : null}
    </div>
  );
}

function preventSpaceButtonClick(event: React.KeyboardEvent<HTMLButtonElement>) {
  if (event.key === " ") {
    event.preventDefault();
  }
}
