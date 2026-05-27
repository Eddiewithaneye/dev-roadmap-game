export type RunStatus = "running" | "completed" | "defeated";

export type RunSummary = {
  status: RunStatus;
  elapsedSeconds: number;
  enemiesDefeated: number;
  xpGained: number;
};

export function getRunStatus(
  playerHealth: number,
  elapsedSeconds: number,
  survivalGoalSeconds: number,
): RunStatus {
  if (playerHealth <= 0) {
    return "defeated";
  }

  if (elapsedSeconds >= survivalGoalSeconds) {
    return "completed";
  }

  return "running";
}
