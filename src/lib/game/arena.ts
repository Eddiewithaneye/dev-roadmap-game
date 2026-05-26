export type ArenaPercentRect = {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
};

// Story 6 camera target: a 16:9 gameplay frame that scales to the browser.
// Future Phaser work can use these same dimensions as the first camera size.
export const ARENA_LAYOUT = {
  camera: {
    width: 1280,
    height: 3000,
    aspectRatio: "16 / 9",
  },
  hudSafeZones: {
    topPercent: 100,
    bottomPercent: 100,
  },
  walkableArea: {
    xPercent: 6,
    yPercent: 39,
    widthPercent: 88,
    heightPercent: 34,
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
