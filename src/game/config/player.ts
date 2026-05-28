export type PlayerFacing = -1 | 1;

export type PlayerPosition = {
  xPercent: number;
  groundYPercent: number;
  facing: PlayerFacing;
};

export const PLAYER_PLACEHOLDER_TUNING = {
  xPercent: 30,
  groundYPercent: 62,
  facing: 1,
  widthPx: 64,
  heightPx: 96,
  scale: 1,
} as const;

export const PLAYER_MOVEMENT_TUNING = {
  speedPxPerSecond: 280,
} as const;
