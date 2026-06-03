import { RUN_TUNING } from "@/game/config/run";

export class EnemySpawnerSystem {
  private nextSpawnAt: number = RUN_TUNING.initialSpawnDelayMs;
  private roundSpawnIntervalMs: number = RUN_TUNING.baseSpawnIntervalMs;

  update(elapsedMs: number) {
    if (elapsedMs < this.nextSpawnAt) {
      return false;
    }

    this.nextSpawnAt = elapsedMs + this.roundSpawnIntervalMs;
    return true;
  }

  speedUp() {
    this.roundSpawnIntervalMs = Math.max(
      RUN_TUNING.minimumSpawnIntervalMs,
      this.roundSpawnIntervalMs - RUN_TUNING.spawnIntervalChangeMs,
    );
  }

  slowDown() {
    this.roundSpawnIntervalMs = Math.min(
      RUN_TUNING.maximumSpawnIntervalMs,
      this.roundSpawnIntervalMs + RUN_TUNING.spawnIntervalChangeMs,
    );
  }

  reset() {
    this.roundSpawnIntervalMs = RUN_TUNING.baseSpawnIntervalMs;
  }
}
