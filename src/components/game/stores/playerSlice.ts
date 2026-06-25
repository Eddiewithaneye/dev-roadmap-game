import type { StateCreator } from 'zustand';
import type { GameStore } from './useGameStore';

export type PlayerSlice = {
    health: number,
    maxHealth: number,
    currentMovementSpeed: number,
    takeDamage: (amount:number) => void,
    gainHealth: (amount:number) => void,
    isInvulnerable: boolean,
    setInvulnerable: (isInvulnerable: boolean) => void,
    setCurrentMovementSpeed: (currentMovementSpeed: number) => void,
}

const INITIAL_HEALTH = 100;
const INITIAL_MAX_HEALTH = 100;

export const createPlayerSlice: StateCreator<GameStore,[],[],PlayerSlice>
    = (set) => ({
        health: INITIAL_HEALTH,
        maxHealth: INITIAL_MAX_HEALTH,
        currentMovementSpeed: 0,
        isInvulnerable: false,
        takeDamage: (amount:number) => set((state) => ({
            health: state.isInvulnerable
                ? state.health
                : Math.max(0, state.health - amount),
        })),
        gainHealth: (amount:number) => set((state) => ({health: Math.min(state.maxHealth, state.health + amount)})),
        setInvulnerable: (isInvulnerable:boolean) => set(() => ({isInvulnerable})),
        setCurrentMovementSpeed: (currentMovementSpeed:number) =>
            set(() => ({currentMovementSpeed})),
    })