import type { EnemyCategory } from "@/game/domain/types";

export type EnemyDefinition = {
  id: string;
  name: string;
  category: EnemyCategory;
  health: number;
  speed: number;
  damage: number;
  xpReward: number;
};

export const ENEMIES = [
  {
    id: "data-colossus",
    name: "Data Colossus",
    category: "Challenge",
    health: 120,
    speed: 52,
    damage: 12,
    xpReward: 125,
  },
] as const satisfies readonly EnemyDefinition[];
