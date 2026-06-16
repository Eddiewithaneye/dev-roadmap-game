import type { StateCreator } from "zustand";
import type { GameStore } from "./useGameStore";

export type ResourceSlice = {
    codeFragments: number,
    cred: number,
    grantCodeFragments: (amount: number) => void,
    grantCred: (amount: number) => void,
}

const INITIAL_CODEFRAGMENTS = 0;
const INITIAL_CRED = 0;

export const createResourceSlice: StateCreator<GameStore,[],[],ResourceSlice> = (set) =>({
    codeFragments: INITIAL_CODEFRAGMENTS,
    cred: INITIAL_CRED,

    // function flow is name: input => set(currentState => newStateObject)
    grantCodeFragments: (amount) => set((state) => ({codeFragments: state.codeFragments + amount})),
    grantCred: (amount) => set((state) => ({cred: state.cred + amount})),


});