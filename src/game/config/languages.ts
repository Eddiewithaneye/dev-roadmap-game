export type LanguageCategory = "language";

export type LanguageDefinition = {
  id: string;
  name: string;
  category: LanguageCategory;
  manifestation: string;
  shortDescription: string;
  attackPattern: string;
  stats: {
    damage: number;
    cooldown: number;
    range: number;
  };
};

export const LANGUAGES = [
  {
    id: "javascript",
    name: "JavaScript",
    category: "language",
    manifestation: "Event Spark Wand",
    shortDescription:
      "A language used to add behavior and interactivity to web apps.",
    attackPattern: "chain-spark",
    stats: {
      damage: 18,
      cooldown: 3,
      range: 6,
    },
  },
  {
    id: "python",
    name: "Python",
    category: "language",
    manifestation: "Indentation Familiar",
    shortDescription:
      "A readable general-purpose language used across apps, data, and automation.",
    attackPattern: "homing-helper",
    stats: {
      damage: 14,
      cooldown: 2,
      range: 5,
    },
  },
  {
    id: "sql",
    name: "SQL",
    category: "language",
    manifestation: "Query Bow",
    shortDescription:
      "A language used to query and work with structured data.",
    attackPattern: "piercing-row-shot",
    stats: {
      damage: 24,
      cooldown: 4,
      range: 8,
    },
  },
] as const satisfies readonly LanguageDefinition[];
