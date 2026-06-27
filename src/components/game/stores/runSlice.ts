 import type { StateCreator } from "zustand";
 import {
    EMPTY_SPRINT_STATS,
    type SprintMode,
    type SprintOutcome,
    type SprintStats,
 } from "@/game/domain/sprint";
 import {
    javascriptLanguageWeapon,
    sqlBowWeapon,
 } from "@/game/config/weapons";
 import type { GameStore } from "./useGameStore";
 
 export type RunSlice = {
    sprintMode: SprintMode;
    sprintOutcome: SprintOutcome;
    sprintStats: SprintStats;
    attackKillsById: Record<string, number>;
    isSprintRetroCredGranted: boolean;
    switchToWaterfall: () => void;
    setSprintOutcome: (outcome: SprintOutcome) => void;
    setTimeSurvivedSeconds: (seconds: number) => void;
    recordEnemyDefeated: (attackId: string | null) => void;
    markSprintRetroCredGranted: () => void;
    resetRun: () => void;
 }

const INITIAL_HEALTH = 100
const INITIAL_XP = 0;
const INITIAL_LEVEL = 0;
const INITIAL_XP_GOAL = 45;
const INITIAL_ENEMIES = 5;
const INITIAL_CODE_FRAGMENTS = 0;

export const createRunSlice: StateCreator<GameStore,[],[],RunSlice> = (set) => ({
    sprintMode: "sprint",
    sprintOutcome: "running",
    sprintStats: EMPTY_SPRINT_STATS,
    attackKillsById: {},
    isSprintRetroCredGranted: false,
    switchToWaterfall: () => set(() => ({
        sprintMode: "waterfall",
        sprintOutcome: "running",
    })),
    setSprintOutcome: (outcome) => set(() => ({ sprintOutcome: outcome })),
    setTimeSurvivedSeconds: (seconds) => set((state) => ({
        sprintStats: {
            ...state.sprintStats,
            timeSurvivedSeconds: Math.max(
                state.sprintStats.timeSurvivedSeconds,
                seconds,
            ),
        },
    })),
    recordEnemyDefeated: (attackId) => set((state) => {
        const attackKillsById = {
            ...state.attackKillsById,
        };

        let maxKillsInOneAttack = state.sprintStats.maxKillsInOneAttack;

        if (attackId) {
            attackKillsById[attackId] = (attackKillsById[attackId] ?? 0) + 1;
            maxKillsInOneAttack = Math.max(
                maxKillsInOneAttack,
                attackKillsById[attackId],
            );
        }

        return {
            attackKillsById,
            sprintStats: {
                ...state.sprintStats,
                enemiesDefeated: state.sprintStats.enemiesDefeated + 1,
                maxKillsInOneAttack,
            },
        };
    }),
    markSprintRetroCredGranted: () => set(() => ({
        isSprintRetroCredGranted: true,
    })),
    resetRun: () => {
        set(() => ({
            health: INITIAL_HEALTH,
            maxHealth: INITIAL_HEALTH,
            xp: INITIAL_XP,
            level: INITIAL_LEVEL,
            xpGoal: INITIAL_XP_GOAL,
            pendingLevelUps: 0,
            enemies: INITIAL_ENEMIES,
            codeFragments:INITIAL_CODE_FRAGMENTS,
            sprintMode: "sprint",
            sprintOutcome: "running",
            sprintStats: EMPTY_SPRINT_STATS,
            isSprintRetroCredGranted: false,
            movementSpeedMultiplier: 1,
            cooldownMultiplier: 1,
            damageMultiplier: 1,
            armorFlat: 0,
            runStatAllocations: {
                stamina: 0,
                flow: 0,
                proficiency: 0,
                security: 0,
                efficiency: 0,
            },
            attackKillsById: {},
            purchasedGitFetchUpgrades: {},
            weaponsBySlot: {
                language: javascriptLanguageWeapon,
                sql: sqlBowWeapon,
            },
        }))
    },
});
