// This file will be used to store weapon data.
import { Weapon } from "@/types/weapon";

export const javascriptLanguageWeapon: Weapon = {
    category: "Language",
    name: "JavaScript",
    weaponName: "Event Spark Wand",
    description: "A fast fantasy-tech rod that launches electric bolts and chain-style code arcs.",
    damage: 18,
    cooldown: 3,
    range: 6,
    icon: "⚡",
    visualEffect: "Fast electric bolts and chained code spark effects.",
    imageSrc: "/images/Event_Spark_Wand.png",
};

export const gameWeapons: Weapon[] = [javascriptLanguageWeapon];

