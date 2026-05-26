export type WeaponCategory = "Language" | "Framework" | "Tool" | "Library" | "Platform";

export type Weapon = {
    category: WeaponCategory;
    name: string; // actual tech identity, e.g. JavaScript
    weaponName: string; // fantasy-tech manifestation, e.g. Event Spark Wand
    description: string;
    damage: number;
    cooldown: number;
    range: number;
    icon: string;
    visualEffect?: string; // optional descriptive effect for UI/animation
    imageSrc?: string; // optional weapon art asset path
};