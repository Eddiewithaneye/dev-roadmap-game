import { LANGUAGES } from "./languages";
import type { Weapon } from "@/types/weapon";

const javascript = LANGUAGES[0];

export const javascriptLanguageWeapon: Weapon = {
  category: "Language",
  name: javascript.name,
  weaponName: javascript.manifestation,
  description:
    "A fast fantasy-tech rod that launches electric bolts and chain-style code arcs.",
  damage: 20,
  cooldown: javascript.stats.cooldown,
  range: javascript.stats.range,
  icon: "JS",
  effect: "chain-spark",
  screenShakeIntensity: "light",
  visualEffect: "Fast electric bolts and chained code spark effects.",
  imageSrc: "/images/Event_Spark_Wand.png",
};

export const sqlBowWeapon: Weapon = {
  category: "Language",
  name: "SQL",
  weaponName: "Querystring Bow",
  description:
    "A simple test weapon that fires one straight query arrow down the current lane.",
  damage: 8,
  cooldown: 1.4,
  range: 18,
  icon: "SQL",
  effect: "straight-shot",
  screenShakeIntensity: "none",
  visualEffect:
    "Straight-line arrow projectile with lane-based hit detection.",
  imageSrc: "/images/sql-bow-placeholder.svg",
};

export const gameWeapons: Weapon[] = [javascriptLanguageWeapon, sqlBowWeapon];
