import type { StateCreator } from 'zustand';
import type { GameStore } from './useGameStore';

export type PlayerSlice = {
    health: number,
    maxHealth: number,
    takeDamage: (amount:number) => void,
    gainHealth: (amount:number) => void,
}

const INITIAL_HEALTH = 100;
const INITIAL_MAX_HEALTH = 100;

export const createPlayerSlice: StateCreator<GameStore,[],[],PlayerSlice>
    = (set) => ({
        health: INITIAL_HEALTH,
        maxHealth: INITIAL_MAX_HEALTH,
        takeDamage: (amount:number) => set((state) => ({health: Math.max(0, state.health - amount)})),
        gainHealth: (amount:number) => set((state) => ({health: Math.min(state.maxHealth, state.health + amount)})),
    })