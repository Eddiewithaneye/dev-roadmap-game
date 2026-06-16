 import type { StateCreator } from "zustand";
 import type { GameStore } from "./useGameStore";
 
 export type RunSlice = {
    resetRun: () => void,
 }

const INITIAL_HEALTH = 100
const INITIAL_XP = 0;
const INITIAL_LEVEL = 0;
const INITIAL_XP_GOAL = 100;
const INITIAL_ENEMIES = 5;
const INITIAL_CODE_FRAGMENTS = 0;

export const createRunSlice: StateCreator<GameStore,[],[],RunSlice> = (set) => ({
    resetRun: () => {
        set(() => ({
            health: INITIAL_HEALTH,
            xp: INITIAL_XP,
            level: INITIAL_LEVEL,
            xpGoal: INITIAL_XP_GOAL,
            enemies: INITIAL_ENEMIES,
            codeFragments:INITIAL_CODE_FRAGMENTS,
        }))
    },
});