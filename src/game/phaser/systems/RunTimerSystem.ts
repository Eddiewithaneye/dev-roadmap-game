import { RUN_TUNING } from "@/game/config/run";

export class RunTimerSystem {
  getElapsedSeconds(elapsedMs: number) {
    return Math.floor(elapsedMs / 1000);
  }

  getRemainingSeconds(elapsedMs: number) {
    return Math.max(
      0,
      RUN_TUNING.survivalGoalSeconds - this.getElapsedSeconds(elapsedMs),
    );
  }
}
