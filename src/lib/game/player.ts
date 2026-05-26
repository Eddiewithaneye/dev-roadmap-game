export type PlayerPlaceholderTuning = {
  xPercent: number;
  groundYPercent: number;
  widthPx: number;
  heightPx: number;
  scale: number;
};

// Story 4 tuning lives here so position and scale can be adjusted without
// digging through the placeholder player's shape markup.
export const PLAYER_PLACEHOLDER_TUNING = {
  xPercent: 30,
  groundYPercent: 62,
  widthPx: 64,
  heightPx: 96,
  scale: 1,
} as const satisfies PlayerPlaceholderTuning;
