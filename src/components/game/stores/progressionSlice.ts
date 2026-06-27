import type { StateCreator } from "zustand";
import type { GameStore } from "./useGameStore";

export type ProgressionSlice = {
    xp: number;
    xpGoal: number;
    grantXp: (amount: number) => void;
    completePendingLevelUp: () => void;
    level: number;
    pendingLevelUps: number;
}

const INITIAL_XP = 0;
const INITIAL_LEVEL = 0;
const INITIAL_XP_GOAL = 45;

export const createProgressionSlice: StateCreator<GameStore,[],[],ProgressionSlice> = (set) =>({
    xp:INITIAL_XP,
    xpGoal: INITIAL_XP_GOAL,
    level: INITIAL_LEVEL,
    pendingLevelUps: 0,
    grantXp: (amount) => set((state) => {
        let nextXp = state.xp + amount;
        let nextXpGoal = state.xpGoal;
        let nextPendingLevelUps = state.pendingLevelUps;

        while (nextXp >= nextXpGoal) {
            nextXp -= nextXpGoal;
            nextPendingLevelUps += 1;
            nextXpGoal = Math.round(nextXpGoal * 1.3);
        }

        return {
            xp: nextXp,
            xpGoal: nextXpGoal,
            pendingLevelUps: nextPendingLevelUps,
            sprintStats: {
                ...state.sprintStats,
                xpGained: state.sprintStats.xpGained + amount,
            },
        };

    }),
    completePendingLevelUp: () => set((state) => ({
        level: state.level + 1,
        pendingLevelUps: Math.max(0, state.pendingLevelUps - 1),
    })),

    });
