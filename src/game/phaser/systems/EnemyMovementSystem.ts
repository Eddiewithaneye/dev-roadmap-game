import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { ArenaRect } from "@/game/domain/types";

export class EnemyMovementSystem {
  private readonly directions = new Map<EnemyActor, -1 | 1>();

  constructor(
    private readonly enemies: EnemyActor[],
    private readonly walkableArea: ArenaRect,
  ) {}

  update(deltaMs: number) {
    const forwardLimit = this.walkableArea.x + this.walkableArea.width * 0.66;
    const backwardLimit = this.walkableArea.x + this.walkableArea.width * 0.78;

    for (const enemy of this.enemies) {
      const currentDirection = this.directions.get(enemy) ?? -1;
      let nextDirection = currentDirection;

      if (enemy.container.x <= forwardLimit) {
        nextDirection = 1;
      } else if (enemy.container.x >= backwardLimit) {
        nextDirection = -1;
      }

      this.directions.set(enemy, nextDirection);
      enemy.container.x += nextDirection * Math.min(deltaMs, 50) * 0.014;
    }
  }
}
