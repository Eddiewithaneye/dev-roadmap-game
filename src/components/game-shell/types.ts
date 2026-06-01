import type { Dispatch, SetStateAction } from "react";
import type { Enemy } from "@/game/domain/types";
import type { Weapon } from "@/types/weapon";

export type WeaponPanelMode = "player" | "dev";
export type DevToolsPosition = "top" | "left" | "right";

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
  imageSrc?: string;
  label: string;
  locked?: boolean;
  active?: boolean;
  cooldownProgress?: number;
  onClick?: () => void;
};

export type XpBarProps = {
  level: number;
  xp: number;
  xpGoal: number;
};

export type EnemyPanelProps = {
  enemy: Enemy;
  enemies: number;
  maxEnemies: number;
};

export type DevControlsProps = {
  health: number;
  xp: number;
  xpGoal: number;
  enemies: number;
  position: DevToolsPosition;
  setHealth: Dispatch<SetStateAction<number>>;
  setCodeFragments: Dispatch<SetStateAction<number>>;
  setCred: Dispatch<SetStateAction<number>>;
  setXp: Dispatch<SetStateAction<number>>;
  setEnemies: Dispatch<SetStateAction<number>>;
  setPosition: Dispatch<SetStateAction<DevToolsPosition>>;
};

export type GameHudProps = {
  runTimeLabel: string;
  health: number;
  codeFragments: number;
  cred: number;
  xp: number;
  enemies: number;
  level: number;
  maxHealth: number;
  xpGoal: number;
  maxEnemies: number;
  enemy: Enemy;
  weapon: Weapon;
  selectedSlot: "language" | null;
  weaponCooldownProgress: number;
  isDevMode: boolean;
  isSettingsOpen: boolean;
  onLanguageSlotClick: () => void;
  onSettingsClick: () => void;
  onDevModeChange: (isDevMode: boolean) => void;
};

export type SettingsMenuProps = {
  isDevMode: boolean;
  onDevModeChange: (isDevMode: boolean) => void;
};

export type WeaponPanelProps = {
  weapon: Weapon;
  mode: WeaponPanelMode;
  isReady: boolean;
  cooldownRemaining: number;
  onAttack: () => void;
  onDamageChange: (value: number) => void;
  onCooldownChange: (value: number) => void;
  onRangeChange: (value: number) => void;
};
