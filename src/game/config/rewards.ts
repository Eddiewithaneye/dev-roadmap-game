export type RewardDefinition = {
  id: string;
  label: string;
  xp: number;
  codeFragments: number;
};

export const REWARDS = [
  {
    id: "default-enemy-defeat",
    label: "Default enemy defeat",
    xp: 125,
    codeFragments: 25,
  },
] as const satisfies readonly RewardDefinition[];
