import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";

export class EnemyMovementSystem {
  constructor(
    private readonly enemies: EnemyActor[],
    private readonly player: PlayerActor,
  ) {}

  update(deltaMs: number) {
    for(const enemy of this.enemies){
      const dx = this.player.container.x - enemy.container.x;
      const distance = Math.abs(dx);

    if (distance < 180) {
      continue;
    }

    const direction = dx > 0 ? 1 : -1;
    enemy.container.x += direction * Math.min(deltaMs, 50) * 0.025;
  }
  }
}
