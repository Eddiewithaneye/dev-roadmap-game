import type { Dispatch, SetStateAction } from "react";

export type ResourceStatProps = {
  icon: string;
  label: string;
  value: number;
};

export type PlayerCardProps = {
  health: number;
  level: number;
  maxHealth: number;
};

export type AbilitySlotProps = {
  icon: string;
  label: string;
  locked?: boolean;
};

export type XpBarProps = {
  level: number;
  xp: number;
  xpGoal: number;
};

export type BossBarProps = {
  enemies: number;
  maxEnemies: number;
};

export type DevControlsProps = {
  health: number;
  xp: number;
  xpGoal: number;
  enemies: number;
  setHealth: Dispatch<SetStateAction<number>>;
  setCodeFragments: Dispatch<SetStateAction<number>>;
  setCred: Dispatch<SetStateAction<number>>;
  setXp: Dispatch<SetStateAction<number>>;
  setEnemies: Dispatch<SetStateAction<number>>;
};

export type GameHudProps = {
  health: number;
  codeFragments: number;
  cred: number;
  xp: number;
  enemies: number;
  level: number;
  maxHealth: number;
  xpGoal: number;
  maxEnemies: number;
};
