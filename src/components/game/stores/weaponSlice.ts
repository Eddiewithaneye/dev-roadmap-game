import type { StateCreator } from "zustand";

import {
  GIT_FETCH_UPGRADES,
  type GitFetchUpgradeId,
} from "@/game/config/git-fetch-upgrades";
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
  purchasedGitFetchUpgrades: Partial<Record<GitFetchUpgradeId, number>>;
  updateWeaponField: (
    slot: TunableWeaponSlot,
    field: WeaponTuningField,
    value: number,
  ) => void;
  purchaseGitFetchUpgrade: (upgradeId: GitFetchUpgradeId) => boolean;
};

export const createWeaponSlice: StateCreator<GameStore, [], [], WeaponSlice> =
  (set, get) => ({
    weaponsBySlot: {
      language: javascriptLanguageWeapon,
      sql: sqlBowWeapon,
    },
    purchasedGitFetchUpgrades: {},
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
    purchaseGitFetchUpgrade: (upgradeId) => {
      const upgrade = GIT_FETCH_UPGRADES.find((item) => item.id === upgradeId);

      if (!upgrade) {
        return false;
      }

      const currentPurchases = get().purchasedGitFetchUpgrades[upgradeId] ?? 0;

      if (currentPurchases >= upgrade.maxPurchases) {
        return false;
      }

      if (!get().spendCodeFragments(upgrade.cost)) {
        return false;
      }

      set((state) => {
        const currentWeapon = state.weaponsBySlot[upgrade.weaponSlot];
        const nextWeapon = applyGitFetchEffect(currentWeapon, upgrade.effect);

        return {
          weaponsBySlot: {
            ...state.weaponsBySlot,
            [upgrade.weaponSlot]: nextWeapon,
          },
          purchasedGitFetchUpgrades: {
            ...state.purchasedGitFetchUpgrades,
            [upgradeId]: currentPurchases + 1,
          },
        };
      });

      return true;
    },
  });

function applyGitFetchEffect(
  weapon: Weapon,
  effect: (typeof GIT_FETCH_UPGRADES)[number]["effect"],
): Weapon {
  if (effect.field === "cooldown") {
    return {
      ...weapon,
      cooldown: Math.max(0.15, weapon.cooldown * effect.multiplier),
    };
  }

  if (effect.field === "projectileCount") {
    return {
      ...weapon,
      projectileCount: (weapon.projectileCount ?? 1) + effect.amount,
    };
  }

  return {
    ...weapon,
    [effect.field]: ((weapon[effect.field] as number | undefined) ?? 0) + effect.amount,
  };
}
