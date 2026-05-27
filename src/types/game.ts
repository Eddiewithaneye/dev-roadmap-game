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
