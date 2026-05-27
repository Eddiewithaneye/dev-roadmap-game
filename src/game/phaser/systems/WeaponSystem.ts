import * as Phaser from "phaser";

import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { WeaponEffects } from "@/game/phaser/effects/WeaponEffects";

export class WeaponSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: PlayerActor,
    private readonly enemy: EnemyActor,
  ) {}

  fire() {
    WeaponEffects.spark(this.scene, this.player.container, this.enemy.container);
  }
}
