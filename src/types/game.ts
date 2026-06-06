export type LanguageWeapon = {
  id: string;
  name: string;
  damage: number;
  range: number;
  description: string;
};

export type EnemyDefinition = {
  id: string;
  name: string;
  health: number;
  description: string;
};

export type GameConcept = {
  id: string;
  title: string;
  summary: string;
};

export type LanguageDefinition = {
  id: string;
  name: string;
  category: "language";
  manifestation: string;
  shortDescription: string;
  attackPattern: string;
  stats: {
    damage: number;
    cooldown: number;
    range: number;
  };
  codexEntry?: string;
};
