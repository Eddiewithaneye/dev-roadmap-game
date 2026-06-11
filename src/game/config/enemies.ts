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
    health: 40,
    speed: 52,
    damage: 12,
    xpReward: 12,
  },
  {
    id: "syntax-wisp",
    name: "Syntax Wisp",
    category: "Bug",
    health: 30,
    speed: 85,
    damage: 6,
    xpReward: 10,
  },
] as const satisfies readonly EnemyDefinition[];
