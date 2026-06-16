export const RUN_TUNING = {
  survivalGoalSeconds: 60,
  initialSpawnDelayMs: 500,
  baseSpawnIntervalMs: 3500,
  minimumSpawnIntervalMs: 2500,
  maximumSpawnIntervalMs: 8000,
  spawnIntervalChangeMs: 500,
  maxActiveEnemies: 2,
  enemyDefeatGoal: 5,
} as const;
