export type SprintOutcome = "running" | "victory" | "defeat";

export type SprintMode = "sprint" | "waterfall";

export type RunStatKey =
  | "stamina"
  | "flow"
  | "proficiency"
  | "security"
  | "efficiency";

export type SprintStats = {
  enemiesDefeated: number;
  timeSurvivedSeconds: number;
  xpGained: number;
  codeFragmentsFound: number;
  damageTaken: number;
  maxKillsInOneAttack: number;
};

export type SprintAccomplishment = {
  id: string;
  label: string;
  cred: number;
};

export type SprintRetroSummary = {
  outcome: Exclude<SprintOutcome, "running">;
  stats: SprintStats;
  accomplishments: SprintAccomplishment[];
  credEarned: number;
};

export type GitFetchUpgradeKind =
  | "weapon-upgrade"
  | "weapon-purchase";

export type GitFetchUpgradeEffect =
  | { field: "damage"; amount: number }
  | { field: "cooldown"; multiplier: number }
  | { field: "projectileCount"; amount: number }
  | { field: "pierce"; amount: number }
  | { field: "bounceCount"; amount: number };

export type GitFetchUpgradeRarity = "common" | "uncommon" | "rare";

export type GitFetchUpgradeDefinition = {
  id: string;
  label: string;
  description: string;
  cost: number;
  rarity: GitFetchUpgradeRarity;
  kind: GitFetchUpgradeKind;
  weaponSlot: "language" | "sql";
  maxPurchases: number;
  effect: GitFetchUpgradeEffect;
};

export const EMPTY_SPRINT_STATS: SprintStats = {
  enemiesDefeated: 0,
  timeSurvivedSeconds: 0,
  xpGained: 0,
  codeFragmentsFound: 0,
  damageTaken: 0,
  maxKillsInOneAttack: 0,
};
