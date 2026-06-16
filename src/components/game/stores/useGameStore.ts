import {create} from 'zustand';
import { createPlayerSlice, type PlayerSlice } from './playerSlice';
import { createProgressionSlice, type ProgressionSlice } from './progressionSlice';
import { createResourceSlice, type ResourceSlice } from './resourceSlice';
import { createRunSlice, type RunSlice } from './runSlice';
// constants
const INITIAL_MAX_ENEMIES = 10;
const INITIAL_DAMAGE = 0;
const INITIAL_ENEMIES = 5;


// type aliases
type GameSlice = {
    damage: number,
    weapon: string,
    enemies: number,
    maxEnemies: number,
    defeatEnemy: () => void,
}

export type GameStore = PlayerSlice & GameSlice & ProgressionSlice & ResourceSlice & RunSlice

// stores (if this gets to many stores, create modulas within the file)

export const useGameStore = create<GameStore>()((set,get,store) => ({
    ...createPlayerSlice(set,get,store),
    ...createProgressionSlice(set,get,store),
    ...createResourceSlice(set,get,store),
    ...createRunSlice(set,get,store),
    damage: INITIAL_DAMAGE,
    maxEnemies: INITIAL_MAX_ENEMIES,
    enemies: INITIAL_ENEMIES,
    weapon: "javascript-weapon",
    defeatEnemy: () => set((state)=>({
        enemies: Math.max(0, state.enemies -1)
    })),

}));