export type WeaponCategory =
  | "Language"
  | "Framework"
  | "Tool"
  | "Library"
  | "Platform";

export type WeaponEffect = "chain-spark" | "straight-shot";
export type ScreenShakeIntensity = "none" | "light" | "normal" | "heavy";

export type Weapon = {
  category: WeaponCategory;
  name: string;
  weaponName: string;
  description: string;
  damage: number;
  cooldown: number;
  range: number;
  icon: string;
  effect: WeaponEffect;
  screenShakeIntensity: ScreenShakeIntensity;
  visualEffect?: string;
  imageSrc?: string;
  projectileCount?: number;
  pierce?: number;
  bounceCount?: number;
};
