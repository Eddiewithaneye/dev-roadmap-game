import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";

export class EnemyMovementSystem {
  constructor(
    private readonly enemy: EnemyActor,
    private readonly player: PlayerActor,
  ) {}

  update(deltaMs: number) {
    const dx = this.player.container.x - this.enemy.container.x;
    const distance = Math.abs(dx);

    if (distance < 180) {
      return;
    }

    const direction = dx > 0 ? 1 : -1;
    this.enemy.container.x += direction * Math.min(deltaMs, 50) * 0.025;
  }
}
