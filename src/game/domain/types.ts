import type { Weapon } from "@/types/weapon";

export type ArenaRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EnemyCategory = "Challenge" | "Bug" | "Project" | "Opportunity" | "Boss";

export type Enemy = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  category: EnemyCategory;
  xpReward: number;
};

export type AttackResult = {
  damageDealt: number;
  enemyHealth: number;
  isEnemyDefeated: boolean;
  newCooldownReadyAt: number;
  xpReward: number;
};

export type RuntimeWeapon = Weapon;
