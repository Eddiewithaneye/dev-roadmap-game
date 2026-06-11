import {create} from 'zustand'

interface GameState{
    // Player Stats
    damage: number
    health: number
    xp: number
    codeFragments: number
    level: number
    weapon: string
}
export const useGameStore = create <GameState> ((set)) => ({
    health: 100,
    damage: (amount) => set((state) => ({health: state.health - amount})),


})