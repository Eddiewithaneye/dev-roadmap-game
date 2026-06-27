import type { StateCreator } from 'zustand';
import type { RunStatKey } from '@/game/domain/sprint';
import type { GameStore } from './useGameStore';

export type PlayerSlice = {
    health: number;
    maxHealth: number;
    currentMovementSpeed: number;
    movementSpeedMultiplier: number;
    cooldownMultiplier: number;
    damageMultiplier: number;
    armorFlat: number;
    runStatAllocations: Record<RunStatKey, number>;
    takeDamage: (amount:number) => void;
    gainHealth: (amount:number) => void;
    applyRunStatAllocations: (allocations: Record<RunStatKey, number>) => void;
    isInvulnerable: boolean;
    setInvulnerable: (isInvulnerable: boolean) => void;
    setCurrentMovementSpeed: (currentMovementSpeed: number) => void;
}

const INITIAL_HEALTH = 100;
const INITIAL_MAX_HEALTH = 100;

export const createPlayerSlice: StateCreator<GameStore,[],[],PlayerSlice>
    = (set) => ({
        health: INITIAL_HEALTH,
        maxHealth: INITIAL_MAX_HEALTH,
        currentMovementSpeed: 0,
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
        isInvulnerable: false,
        takeDamage: (amount:number) => set((state) => {
            if (state.isInvulnerable) {
                return { health: state.health };
            }

            const damageTaken = Math.max(
                0,
                Math.round(amount - state.armorFlat),
            );

            return {
                health: Math.max(0, state.health - damageTaken),
                sprintStats: {
                    ...state.sprintStats,
                    damageTaken: state.sprintStats.damageTaken + damageTaken,
                },
            };
        }),
        gainHealth: (amount:number) => set((state) => ({health: Math.min(state.maxHealth, state.health + amount)})),
        applyRunStatAllocations: (allocations) => set((state) => {
            const stamina = allocations.stamina;
            const flow = allocations.flow;
            const proficiency = allocations.proficiency;
            const security = allocations.security;
            const efficiency = allocations.efficiency;
            const maxHealthGain = stamina * 20;

            return {
                maxHealth: state.maxHealth + maxHealthGain,
                health: Math.min(
                    state.maxHealth + maxHealthGain,
                    state.health + maxHealthGain,
                ),
                movementSpeedMultiplier: state.movementSpeedMultiplier * (1 + flow * 0.08),
                cooldownMultiplier: state.cooldownMultiplier * Math.pow(0.92, proficiency),
                armorFlat: state.armorFlat + security * 2,
                damageMultiplier: state.damageMultiplier * (1 + efficiency * 0.1),
                runStatAllocations: {
                    stamina: state.runStatAllocations.stamina + stamina,
                    flow: state.runStatAllocations.flow + flow,
                    proficiency: state.runStatAllocations.proficiency + proficiency,
                    security: state.runStatAllocations.security + security,
                    efficiency: state.runStatAllocations.efficiency + efficiency,
                },
            };
        }),
        setInvulnerable: (isInvulnerable:boolean) => set(() => ({isInvulnerable})),
        setCurrentMovementSpeed: (currentMovementSpeed:number) =>
            set(() => ({currentMovementSpeed})),
    })
