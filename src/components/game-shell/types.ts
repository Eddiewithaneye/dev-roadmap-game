import type { Dispatch, SetStateAction } from "react";
import type { Enemy } from "@/game/domain/types";
import type { Weapon } from "@/types/weapon";

export type WeaponPanelMode = "player" | "dev";
export type DevToolsPosition = "top" | "left" | "right";
export type WeaponSlot = "language" | "sql" | "locked3" | "locked4";
export type InputMode = "desktop" | "touch-landscape" | "touch-portrait";

export type ResourceStatProps = {
  icon: string;
  label: string;
  value: number;
  density?: "default" | "compact";
};

export type PlayerCardProps = {
  health: number;
  level: number;
  maxHealth: number;
  density?: "default" | "compact";
  playerName?: string;
  showExperience?: boolean;
  xp?: number;
  xpGoal?: number;
};

export type AbilitySlotProps = {
  icon: string;
  imageSrc?: string;
  label: string;
  shortcutLabel?: string;
  locked?: boolean;
  active?: boolean;
  cooldownProgress?: number;
  size?: "default" | "mobile";
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onInfoClick?: () => void;
};

export type XpBarProps = {
  level: number;
  xp: number;
  xpGoal: number;
  density?: "default" | "compact";
};

export type PrimaryTarget = Enemy;

export type EnemyPanelProps = {
  primaryTarget: PrimaryTarget;
};

export type DevControlsProps = {
  isMinimized: boolean;
  isRunTimerPaused: boolean;
  onMinimizedChange: (isMinimized: boolean) => void;
  onRunTimerPause: () => void;
  onRunTimerPlay: () => void;
  onRunTimerRestart: () => void;
  onSkipToMiniboss: () => void;
  onSpawnEnemy: () => void;
  position: DevToolsPosition;
  setPosition: Dispatch<SetStateAction<DevToolsPosition>>;
};

export type GameHudProps = {
  runTimeLabel: string;
  isWaterfallMode: boolean;
  isEntryTransitionActive: boolean;
  inputMode: InputMode;
  primaryTarget: PrimaryTarget | null;
  selectedSlot: WeaponSlot;
  weaponCooldownProgressBySlot: Partial<Record<WeaponSlot, number>>;
  isDevMode: boolean;
  isSettingsOpen: boolean;
  onWeaponInfoClick: (slot: WeaponSlot) => void;
  onWeaponSelect: (slot: WeaponSlot) => void;
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
  onClose: () => void;
  onDamageChange: (value: number) => void;
  onCooldownChange: (value: number) => void;
  onRangeChange: (value: number) => void;
};
