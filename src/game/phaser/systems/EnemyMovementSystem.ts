import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { ArenaRect } from "@/game/domain/types";

export class EnemyMovementSystem {
  private direction: -1 | 1 = -1;

  constructor(
    private readonly enemy: EnemyActor,
    private readonly walkableArea: ArenaRect,
  ) {}

  update(deltaMs: number) {
    const forwardLimit = this.walkableArea.x + this.walkableArea.width * 0.66;
    const backwardLimit = this.walkableArea.x + this.walkableArea.width * 0.78;

    if (this.enemy.container.x <= forwardLimit) {
      this.direction = 1;
    } else if (this.enemy.container.x >= backwardLimit) {
      this.direction = -1;
    }

    this.enemy.container.x += this.direction * Math.min(deltaMs, 50) * 0.014;
  }
}
