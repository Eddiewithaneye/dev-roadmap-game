import type { StateCreator } from "zustand";

import {
  javascriptLanguageWeapon,
  sqlBowWeapon,
} from "@/game/config/weapons";
import type { Weapon } from "@/types/weapon";

import type { GameStore } from "./useGameStore";

export type TunableWeaponSlot = "language" | "sql";
export type WeaponTuningField = "damage" | "cooldown" | "range";

export type WeaponSlice = {
  weaponsBySlot: Record<TunableWeaponSlot, Weapon>;
  updateWeaponField: (
    slot: TunableWeaponSlot,
    field: WeaponTuningField,
    value: number,
  ) => void;
};

export const createWeaponSlice: StateCreator<GameStore, [], [], WeaponSlice> =
  (set) => ({
    weaponsBySlot: {
      language: javascriptLanguageWeapon,
      sql: sqlBowWeapon,
    },
    updateWeaponField: (slot, field, value) =>
      set((state) => ({
        weaponsBySlot: {
          ...state.weaponsBySlot,
          [slot]: {
            ...state.weaponsBySlot[slot],
            [field]: value,
          },
        },
      })),
  });
