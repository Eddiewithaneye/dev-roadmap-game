import type { StateCreator } from "zustand";
import type { GameStore } from "./useGameStore";

export type ProgressionSlice = {
    xp: number,
    xpGoal: number,
    grantXp: (amount:number) => void,
    level: number,
}

const INITIAL_XP = 0;
const INITIAL_LEVEL = 0;
const INITIAL_XP_GOAL = 100;

export const createProgressionSlice: StateCreator<GameStore,[],[],ProgressionSlice> = (set) =>({
    xp:INITIAL_XP,
    xpGoal: INITIAL_XP_GOAL,
    level: INITIAL_LEVEL,
    grantXp: (amount) => set((state) => {
        const nextXp = state.xp + amount;

        if(nextXp >= state.xpGoal){
            return{
            xp: INITIAL_XP,
            level: state.level + 1,
            xpGoal: Math.round(state.xpGoal *1.3),
            };
        }
        return{
            xp: nextXp
        };

    }),

    });

