export type ArenaPercentRect = {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
};

export const ARENA_LAYOUT = {
  camera: {
    width: 1280,
    height: 720,
    aspectRatio: "16 / 9",
  },
  hudSafeZones: {
    topPercent: 12,
    bottomPercent: 24,
  },
  walkableArea: {
    xPercent: 6,
    yPercent: 40,
    widthPercent: 88,
    heightPercent: 32,
  },
} as const satisfies {
  camera: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  hudSafeZones: {
    topPercent: number;
    bottomPercent: number;
  };
  walkableArea: ArenaPercentRect;
};
