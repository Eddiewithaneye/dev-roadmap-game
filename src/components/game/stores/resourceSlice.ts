import type { StateCreator } from "zustand";
import type { GameStore } from "./useGameStore";

export type ResourceSlice = {
    codeFragments: number;
    cred: number;
    grantCodeFragments: (amount: number) => void;
    collectCodeFragments: (amount: number) => void;
    spendCodeFragments: (amount: number) => boolean;
    grantCred: (amount: number) => void;
}

const INITIAL_CODEFRAGMENTS = 0;
const INITIAL_CRED = 0;

export const createResourceSlice: StateCreator<GameStore,[],[],ResourceSlice> = (set, get) =>({
    codeFragments: INITIAL_CODEFRAGMENTS,
    cred: INITIAL_CRED,

    // function flow is name: input => set(currentState => newStateObject)
    grantCodeFragments: (amount) => set((state) => ({codeFragments: state.codeFragments + amount})),
    collectCodeFragments: (amount) => set((state) => ({
        codeFragments: state.codeFragments + amount,
        sprintStats: {
            ...state.sprintStats,
            codeFragmentsFound: state.sprintStats.codeFragmentsFound + amount,
        },
    })),
    spendCodeFragments: (amount) => {
        if (get().codeFragments < amount) {
            return false;
        }

        set((state) => ({ codeFragments: state.codeFragments - amount }));
        return true;
    },
    grantCred: (amount) => set((state) => ({cred: state.cred + amount})),


});
