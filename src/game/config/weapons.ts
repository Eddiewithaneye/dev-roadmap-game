import { LANGUAGES } from "./languages";
import type { Weapon } from "@/types/weapon";

const javascript = LANGUAGES[0];

export const javascriptLanguageWeapon: Weapon = {
  category: "Language",
  name: javascript.name,
  weaponName: javascript.manifestation,
  description:
    "A fast fantasy-tech rod that launches electric bolts and chain-style code arcs.",
  damage: javascript.stats.damage,
  cooldown: javascript.stats.cooldown,
  range: javascript.stats.range,
  icon: "JS",
  visualEffect: "Fast electric bolts and chained code spark effects.",
  imageSrc: "/images/Event_Spark_Wand.png",
};

export const gameWeapons: Weapon[] = [javascriptLanguageWeapon];
