import { RUN_TUNING } from "@/game/config/run";

export class EnemySpawnerSystem {
  private nextSpawnAt: number = RUN_TUNING.initialSpawnDelayMs;

  update(elapsedMs: number) {
    if (elapsedMs < this.nextSpawnAt) {
      return false;
    }

    this.nextSpawnAt = elapsedMs + RUN_TUNING.spawnIntervalMs;
    return true;
  }
}
