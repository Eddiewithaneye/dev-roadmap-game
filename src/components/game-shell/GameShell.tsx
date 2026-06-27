"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { ENEMIES } from "@/game/config/enemies";
import { RUN_TUNING } from "@/game/config/run";
import {
  canAttack,
  getNextReadyTime,
  spawnEnemy,
} from "@/game/domain/combat";
import type {
  RunStatKey,
  SprintMode,
  SprintRetroSummary,
} from "@/game/domain/sprint";
import { DevControls } from "./DevControls";
import { GameHud } from "./GameHud";
import { LevelUpModal } from "./LevelUpModal";
import { MobileFullscreenPrompt } from "./MobileFullscreenPrompt";
import { RotateDeviceOverlay } from "./RotateDeviceOverlay";
import { SprintRetroModal } from "./SprintRetroModal";
import { useInputMode } from "./useInputMode";
import { WeaponPanel } from "./WeaponPanel";
import type { DevToolsPosition, PrimaryTarget, WeaponSlot } from "./types";
import type {
  TunableWeaponSlot,
  WeaponTuningField,
} from "../game/stores/weaponSlice";
import { useGameStore } from "@/components/game/stores/useGameStore";

type GameShellProps = {
  children: ReactNode;
  initialMode?: SprintMode;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

const WEAPON_SLOTS: WeaponSlot[] = ["language", "sql", "locked3", "locked4"];
export function GameShell({ children, initialMode = "sprint" }: GameShellProps) {
  // PlayerSlice
  const health = useGameStore((state) => state.health);
  const damageMultiplier = useGameStore((state) => state.damageMultiplier);
  const cooldownMultiplier = useGameStore((state) => state.cooldownMultiplier);
  const applyRunStatAllocations = useGameStore(
    (state) => state.applyRunStatAllocations,
  );
  
  // GameSlice
  const grantXp = useGameStore((state) => state.grantXp);
  const completePendingLevelUp = useGameStore(
    (state) => state.completePendingLevelUp,
  );
  const pendingLevelUps = useGameStore((state) => state.pendingLevelUps);
  const takeDamage = useGameStore((state) => state.takeDamage);
  const defeatEnemy = useGameStore((state) => state.defeatEnemy);
  const resetRun = useGameStore((state) => state.resetRun);
  const weaponsBySlot = useGameStore((state) => state.weaponsBySlot);
  const codeFragments = useGameStore((state) => state.codeFragments);
  const collectCodeFragments = useGameStore(
    (state) => state.collectCodeFragments,
  );
  const grantCred = useGameStore((state) => state.grantCred);
  const sprintMode = useGameStore((state) => state.sprintMode);
  const sprintOutcome = useGameStore((state) => state.sprintOutcome);
  const sprintStats = useGameStore((state) => state.sprintStats);
  const isSprintRetroCredGranted = useGameStore(
    (state) => state.isSprintRetroCredGranted,
  );
  const setSprintOutcome = useGameStore((state) => state.setSprintOutcome);
  const setTimeSurvivedSeconds = useGameStore(
    (state) => state.setTimeSurvivedSeconds,
  );
  const recordEnemyDefeated = useGameStore(
    (state) => state.recordEnemyDefeated,
  );
  const markSprintRetroCredGranted = useGameStore(
    (state) => state.markSprintRetroCredGranted,
  );
  const switchToWaterfall = useGameStore((state) => state.switchToWaterfall);
  const purchasedGitFetchUpgrades = useGameStore(
    (state) => state.purchasedGitFetchUpgrades,
  );
  const purchaseGitFetchUpgrade = useGameStore(
    (state) => state.purchaseGitFetchUpgrade,
  );
  const updateTunedWeaponField = useGameStore(
    (state) => state.updateWeaponField,
  );
  const setInvulnerable = useGameStore((state) => state.setInvulnerable);
  
  // UI responsible state hooks
  const [, setEnemy] = useState(() => spawnEnemy());
  const [readyAtBySlot, setReadyAtBySlot] = useState<
    Partial<Record<WeaponSlot, number>>
  >({});
  const [now, setNow] = useState(() => Date.now());
  const [activeWeaponSlot, setActiveWeaponSlot] =
    useState<WeaponSlot>("language");
  const [isWeaponPanelOpen, setIsWeaponPanelOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(() => getInitialDevMode());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [devToolsPosition, setDevToolsPosition] =
    useState<DevToolsPosition>(() => getInitialDevToolsPosition());
  const [isDevToolsMinimized, setIsDevToolsMinimized] = useState(false);
  const [runStartedAt, setRunStartedAt] = useState(() => Date.now());
  const [pausedRunElapsedMs, setPausedRunElapsedMs] = useState(0);
  const [isRunTimerPaused, setIsRunTimerPaused] = useState(true);
  const [primaryTarget, setPrimaryTarget] = useState<PrimaryTarget | null>(null);
  const [isEntryTransitionVisible, setIsEntryTransitionVisible] =
    useState(true);
  const [isEntryTransitionExiting, setIsEntryTransitionExiting] =
    useState(false);
  const [isEntryLogoDocked, setIsEntryLogoDocked] = useState(false);
  const [isEntryLogoReady, setIsEntryLogoReady] = useState(false);
  const [canRequestFullscreen, setCanRequestFullscreen] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [isFullscreenPromptDismissed, setIsFullscreenPromptDismissed] =
    useState(false);
  const inputMode = useInputMode();
  

  // constants  
  const isPlayerDefeated = health <= 0;
  const activeTunableSlot = getTunableWeaponSlot(activeWeaponSlot);
  const weapon = weaponsBySlot[activeTunableSlot ?? "language"];
  const weaponCooldownProgressBySlot = getCooldownProgressBySlot(
    readyAtBySlot,
    now,
    weaponsBySlot,
    cooldownMultiplier,
  );

  const runElapsedMs = isRunTimerPaused
    ? pausedRunElapsedMs
    : pausedRunElapsedMs + now - runStartedAt;
  const remainingRunSeconds = Math.max(
    0,
    RUN_TUNING.survivalGoalSeconds - Math.floor(runElapsedMs / 1000),
  );

  const elapsedRunSeconds =
    sprintMode === "waterfall"
      ? Math.floor(runElapsedMs / 1000)
      : Math.min(
          RUN_TUNING.survivalGoalSeconds,
          Math.floor(runElapsedMs / 1000),
        );
  const isLevelUpModalOpen =
    pendingLevelUps > 0 && sprintOutcome === "running";

  const runTimeLabel =
    sprintMode === "waterfall"
      ? formatRunTime(Math.floor(runElapsedMs / 1000))
      : formatRunTime(remainingRunSeconds);
  const sprintRetroSummary = useMemo(
    () =>
      sprintOutcome === "running"
        ? null
        : getSprintRetroSummary(sprintOutcome, {
            ...sprintStats,
            timeSurvivedSeconds: Math.max(
              sprintStats.timeSurvivedSeconds,
              elapsedRunSeconds,
            ),
          }),
    [elapsedRunSeconds, sprintOutcome, sprintStats],
  );
  const isTouchLandscape = inputMode === "touch-landscape";
  const shouldOfferFullscreen =
    inputMode !== "desktop" &&
    canRequestFullscreen &&
    !isFullscreenActive &&
    !isFullscreenPromptDismissed;
  const shouldShowMobileFullscreenPrompt =
    inputMode === "touch-landscape" &&
    shouldOfferFullscreen &&
    !isEntryTransitionVisible &&
    sprintOutcome === "running" &&
    !isLevelUpModalOpen;

  useEffect(() => {
    resetRun();
    if (getInitialDevMode()) {
      setInvulnerable(true);
    }

    return () => {
      const codeboundWindow = window as Window & {
        __codeboundRunTimerPaused?: boolean;
      };

      codeboundWindow.__codeboundRunTimerPaused = true;
      window.dispatchEvent(new Event("codebound:run-paused"));
      window.dispatchEvent(
        new CustomEvent("codebound:dev-run-timer-changed", {
          detail: { isPaused: true, isRestarted: false },
        }),
      );
    };
  }, [resetRun, setInvulnerable]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function updateFullscreenState() {
      setCanRequestFullscreen(getCanRequestFullscreen());
      setIsFullscreenActive(Boolean(getFullscreenElement()));
    }

    updateFullscreenState();
    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("webkitfullscreenchange", updateFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
      document.removeEventListener(
        "webkitfullscreenchange",
        updateFullscreenState,
      );
    };
  }, []);

  const requestFullscreen = useCallback(() => {
    void requestDocumentFullscreen()
      .catch(() => undefined)
      .finally(() => {
        setIsFullscreenPromptDismissed(true);
        setIsFullscreenActive(Boolean(getFullscreenElement()));
      });
  }, []);

  const skipFullscreenPrompt = useCallback(() => {
    setIsFullscreenPromptDismissed(true);
  }, []);

  useEffect(() => {
    if (!isEntryLogoReady) {
      return;
    }

    const exitTimeout = window.setTimeout(
      () => setIsEntryTransitionExiting(true),
      80,
    );
    const logoDockedTimeout = window.setTimeout(
      () => setIsEntryLogoDocked(true),
      2400,
    );
    const doneTimeout = window.setTimeout(() => {
      setIsEntryTransitionVisible(false);
      setPausedRunElapsedMs(0);
      setRunStartedAt(Date.now());
      setIsRunTimerPaused(false);
    }, 2480);

    return () => {
      window.clearTimeout(exitTimeout);
      window.clearTimeout(logoDockedTimeout);
      window.clearTimeout(doneTimeout);
    };
  }, [isEntryLogoReady]);

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
      __codeboundInputMode?: string;
    };

    codeboundWindow.__codeboundInputMode = inputMode;
    window.dispatchEvent(
      new CustomEvent("codebound:input-mode-changed", {
        detail: { inputMode },
      }),
    );
  }, [inputMode]);

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

  const fireWeapon = useCallback((slot: WeaponSlot) => {
    if (
      isPlayerDefeated ||
      sprintOutcome !== "running" ||
      isLevelUpModalOpen ||
      isEntryTransitionVisible
    ) {
      return;
    }

    const tunableSlot = getTunableWeaponSlot(slot);

    if (!tunableSlot) {
      return;
    }

    const selectedWeapon = weaponsBySlot[tunableSlot];
    const runtimeWeapon = {
      ...selectedWeapon,
      cooldown: selectedWeapon.cooldown * cooldownMultiplier,
      damage: Math.round(selectedWeapon.damage * damageMultiplier),
    };

    const attackTime = Date.now();
    const slotReadyAt = readyAtBySlot[slot] ?? 0;

    if (!canAttack(slotReadyAt, attackTime)) {
      return;
    }

    setReadyAtBySlot((current) => ({
      ...current,
      [slot]: getNextReadyTime(runtimeWeapon, attackTime),
    }));
    window.dispatchEvent(
      new CustomEvent("codebound:primary-weapon-fired", {
        detail: {
          attackId: `${slot}-${attackTime}`,
          damage: runtimeWeapon.damage,
          effect: runtimeWeapon.effect,
          range: runtimeWeapon.range,
          screenShakeIntensity: runtimeWeapon.screenShakeIntensity,
          projectileCount: runtimeWeapon.projectileCount ?? 1,
          pierce: runtimeWeapon.pierce ?? 0,
          bounceCount: runtimeWeapon.bounceCount ?? 0,
        },
      }),
    );

  }, [
    cooldownMultiplier,
    damageMultiplier,
    isLevelUpModalOpen,
    isEntryTransitionVisible,
    isPlayerDefeated,
    readyAtBySlot,
    sprintOutcome,
    weaponsBySlot,
  ]);

  const handleAttack = useCallback(() => {
    fireWeapon(activeWeaponSlot);
  }, [activeWeaponSlot, fireWeapon]);

  const handleWeaponActivate = useCallback(
    (slot: WeaponSlot) => {
      selectWeapon(slot);

      if (inputMode === "touch-landscape") {
        fireWeapon(slot);
      }
    },
    [fireWeapon, inputMode, selectWeapon],
  );

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

  const resumeSprint = useCallback(() => {
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
    window.dispatchEvent(new Event("codebound:run-resumed"));
  }, [isRunTimerPaused]);

  const pauseSprint = useCallback(() => {
    if (isRunTimerPaused) {
      window.dispatchEvent(new Event("codebound:run-paused"));
      return;
    }

    setPausedRunElapsedMs((elapsedMs) => elapsedMs + Date.now() - runStartedAt);
    setIsRunTimerPaused(true);
    window.dispatchEvent(
      new CustomEvent("codebound:dev-run-timer-changed", {
        detail: { isPaused: true, isRestarted: false },
      }),
    );
    window.dispatchEvent(new Event("codebound:run-paused"));
  }, [isRunTimerPaused, runStartedAt]);

  const playRunTimer = resumeSprint;
  const pauseRunTimer = pauseSprint;

  const restartRunTimer = useCallback(() => {
    setPausedRunElapsedMs(0);
    setRunStartedAt(Date.now());
    setIsRunTimerPaused(false);
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
    window.dispatchEvent(new Event("codebound:run-restarted"));
  }, [resetRun]);

  const startWaterfallMode = useCallback(() => {
    switchToWaterfall();
    setRunStartedAt(Date.now());
    setIsRunTimerPaused(false);
    window.dispatchEvent(
      new CustomEvent("codebound:dev-run-timer-changed", {
        detail: { isPaused: false, isRestarted: false },
      }),
    );
    window.dispatchEvent(new Event("codebound:waterfall-started"));
    window.dispatchEvent(new Event("codebound:run-resumed"));
  }, [switchToWaterfall]);

  useEffect(() => {
    if (sprintOutcome !== "running" || isEntryTransitionVisible) {
      return;
    }

    if (inputMode === "touch-portrait" || shouldShowMobileFullscreenPrompt) {
      const pauseTimeout = window.setTimeout(pauseSprint, 0);

      return () => window.clearTimeout(pauseTimeout);
    }

    if (
      inputMode === "touch-landscape" &&
      !shouldShowMobileFullscreenPrompt &&
      isRunTimerPaused &&
      !isLevelUpModalOpen
    ) {
      const resumeTimeout = window.setTimeout(resumeSprint, 0);

      return () => window.clearTimeout(resumeTimeout);
    }
  }, [
    inputMode,
    isEntryTransitionVisible,
    isLevelUpModalOpen,
    isRunTimerPaused,
    pauseSprint,
    resumeSprint,
    shouldShowMobileFullscreenPrompt,
    sprintOutcome,
  ]);

  useEffect(() => {
    if (
      initialMode !== "waterfall" ||
      sprintMode === "waterfall" ||
      isEntryTransitionVisible
    ) {
      return;
    }

    const startTimeout = window.setTimeout(startWaterfallMode, 120);

    return () => window.clearTimeout(startTimeout);
  }, [initialMode, isEntryTransitionVisible, sprintMode, startWaterfallMode]);


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
      const {xpReward, attackId} = (event as CustomEvent<{
        xpReward: number;
        attackId?: string | null;
      }>).detail;

      if (sprintOutcome !== "running") {
        return;
      }

      defeatEnemy();
      recordEnemyDefeated(attackId ?? null);
      grantXp(xpReward);

      }
    window.addEventListener("codebound:enemy-defeated", handleRewards);

    return () => {
      window.removeEventListener("codebound:enemy-defeated", handleRewards);
    };
  },[defeatEnemy, grantXp, recordEnemyDefeated, sprintOutcome]);
  
  useEffect(() => {
    if (sprintOutcome !== "running") {
      return;
    }

    if (isPlayerDefeated) {
      setTimeSurvivedSeconds(elapsedRunSeconds);
      setSprintOutcome("defeat");
      window.setTimeout(pauseSprint, 0);
      return;
    }

    if (sprintMode === "sprint" && remainingRunSeconds <= 0) {
      setTimeSurvivedSeconds(RUN_TUNING.survivalGoalSeconds);
      setSprintOutcome("victory");
      window.setTimeout(pauseSprint, 0);
    }
  }, [
    elapsedRunSeconds,
    isPlayerDefeated,
    pauseSprint,
    remainingRunSeconds,
    setSprintOutcome,
    setTimeSurvivedSeconds,
    sprintMode,
    sprintOutcome,
  ]);

  useEffect(() => {
    if (!isLevelUpModalOpen) {
      return;
    }

    const pauseTimeout = window.setTimeout(pauseSprint, 0);

    return () => window.clearTimeout(pauseTimeout);
  }, [isLevelUpModalOpen, pauseSprint]);

  useEffect(() => {
    function handleCodeFragmentCollected(event: Event) {
      const { amount } = (event as CustomEvent<{ amount: number }>).detail;

      collectCodeFragments(amount);
    }

    window.addEventListener(
      "codebound:code-fragment-collected",
      handleCodeFragmentCollected,
    );

    return () => {
      window.removeEventListener(
        "codebound:code-fragment-collected",
        handleCodeFragmentCollected,
      );
    };
  }, [collectCodeFragments]);

  useEffect(() => {
    if (!sprintRetroSummary || isSprintRetroCredGranted) {
      return;
    }

    grantCred(sprintRetroSummary.credEarned);
    markSprintRetroCredGranted();
  }, [
    grantCred,
    isSprintRetroCredGranted,
    markSprintRetroCredGranted,
    sprintRetroSummary,
  ]);

  const updateWeaponField = (field: WeaponTuningField, value: number) => {
    if (!activeTunableSlot) {
      return;
    }

    updateTunedWeaponField(activeTunableSlot, field, value);
  };

  const confirmLevelUpStats = useCallback(
    (allocations: Record<RunStatKey, number>) => {
      applyRunStatAllocations(allocations);
      completePendingLevelUp();

      if (pendingLevelUps <= 1 && sprintOutcome === "running") {
        resumeSprint();
      }
    },
    [
      applyRunStatAllocations,
      completePendingLevelUp,
      pendingLevelUps,
      resumeSprint,
      sprintOutcome,
    ],
  );

  useEffect(() => {
    function handleVictory () {
      if (sprintMode !== "sprint" || sprintOutcome !== "running") {
        return;
      }

      setTimeSurvivedSeconds(elapsedRunSeconds);
      setSprintOutcome("victory");
      window.setTimeout(pauseSprint, 0);
    }

    window.addEventListener("codebound:run-victory", handleVictory);

    return () => {
      window.removeEventListener("codebound:run-victory", handleVictory)
    };

  }, [
    elapsedRunSeconds,
    pauseSprint,
    setSprintOutcome,
    setTimeSurvivedSeconds,
    sprintMode,
    sprintOutcome,
  ]);

  // WHERE COMPONENT RENDERING BEGINS!
  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-[#071018] text-white ${
        isEntryTransitionVisible ? "game-shell--entry-active" : ""
      } ${
        isEntryTransitionVisible && isEntryTransitionExiting
          ? "game-shell--entry-exiting"
          : ""
      } ${isTouchLandscape ? "game-shell--touch-landscape" : ""}`}
    >
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


      {sprintRetroSummary ? (
        <SprintRetroModal
          summary={sprintRetroSummary}
          onRestart={restartRun}
          onSwitchToWaterfall={startWaterfallMode}
        />
      ) : null}

      {isLevelUpModalOpen ? (
        <LevelUpModal
          codeFragments={codeFragments}
          pendingLevelUps={pendingLevelUps}
          purchasedGitFetchUpgrades={purchasedGitFetchUpgrades}
          onConfirmStats={confirmLevelUpStats}
          onPurchaseUpgrade={purchaseGitFetchUpgrade}
        />
      ) : null}

      <GameHud
        primaryTarget={primaryTarget}
        runTimeLabel={runTimeLabel}
        isWaterfallMode={sprintMode === "waterfall"}
        isEntryTransitionActive={isEntryTransitionVisible && !isEntryLogoDocked}
        inputMode={inputMode}
        isDevMode={isDevMode}
        isSettingsOpen={isSettingsOpen}
        onDevModeChange={setIsDevMode}
        onWeaponInfoClick={(slot) => {
          selectWeapon(slot);
          setIsWeaponPanelOpen((isOpen) =>
            activeWeaponSlot === slot ? !isOpen : true,
          );
        }}
        onWeaponSelect={handleWeaponActivate}
        onSettingsClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
        selectedSlot={activeWeaponSlot}
        weaponCooldownProgressBySlot={weaponCooldownProgressBySlot}
      />

      {inputMode === "touch-portrait" ? (
        <RotateDeviceOverlay
          canRequestFullscreen={canRequestFullscreen}
          isFullscreenActive={isFullscreenActive}
          onRequestFullscreen={requestFullscreen}
          onSkipFullscreen={skipFullscreenPrompt}
          showFullscreenPrompt={shouldOfferFullscreen}
        />
      ) : null}

      {shouldShowMobileFullscreenPrompt ? (
        <MobileFullscreenPrompt
          canRequestFullscreen={canRequestFullscreen}
          onRequestFullscreen={requestFullscreen}
          onSkipFullscreen={skipFullscreenPrompt}
        />
      ) : null}

      {isEntryTransitionVisible ? (
        <div
          className={`game-entry-overlay ${
            isEntryTransitionExiting ? "game-entry-overlay--exit" : ""
          }`}
        >
          <div className="game-entry-whiteout codebound-loading-backdrop" />
          <Image
            alt="Codebound"
            className="game-entry-logo"
            height={1344}
            onError={() => setIsEntryLogoReady(true)}
            onLoad={() => setIsEntryLogoReady(true)}
            priority
            src="/images/codebound-logo.png"
            width={3168}
          />
          <div className="game-entry-loading">
            <div className="h-32 w-32 animate-ping rounded-full bg-cyan-200/20" />
            <div className="absolute text-2xl font-black uppercase tracking-[0.3em] text-cyan-50">
              Loading
            </div>
          </div>
        </div>
      ) : null}
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
  cooldownMultiplier: number,
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
        Math.min(
          1,
          Math.max(
            0,
            (readyAt - now) / (slotWeapon.cooldown * cooldownMultiplier * 1000),
          ),
        ),
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

function getFullscreenElement() {
  if (typeof document === "undefined") {
    return null;
  }

  const fullscreenDocument = document as FullscreenDocument;

  return (
    document.fullscreenElement ??
    fullscreenDocument.webkitFullscreenElement ??
    null
  );
}

function getCanRequestFullscreen() {
  if (typeof document === "undefined") {
    return false;
  }

  const fullscreenElement = document.documentElement as FullscreenElement;

  return Boolean(
    fullscreenElement.requestFullscreen ??
      fullscreenElement.webkitRequestFullscreen,
  );
}

async function requestDocumentFullscreen() {
  const fullscreenElement = document.documentElement as FullscreenElement;

  if (fullscreenElement.requestFullscreen) {
    await fullscreenElement.requestFullscreen();
    return;
  }

  await fullscreenElement.webkitRequestFullscreen?.();
}

function getSprintRetroSummary(
  outcome: "victory" | "defeat",
  stats: SprintRetroSummary["stats"],
): SprintRetroSummary {
  const accomplishments: SprintRetroSummary["accomplishments"] = [];

  if (stats.damageTaken === 0) {
    accomplishments.push({
      id: "perfect",
      label: "Perfect - Took no damage",
      cred: 25,
    });
  }

  if (stats.maxKillsInOneAttack >= 5) {
    accomplishments.push({
      id: "five-in-one",
      label: "Killed 5 enemies with one blow",
      cred: 20,
    });
  }

  const credEarned =
    (outcome === "victory" ? 50 : 10) +
    stats.enemiesDefeated +
    Math.floor(stats.timeSurvivedSeconds / 15) +
    Math.floor(stats.codeFragmentsFound / 25) +
    accomplishments.reduce((total, item) => total + item.cred, 0);

  return {
    outcome,
    stats,
    accomplishments,
    credEarned,
  };
}
