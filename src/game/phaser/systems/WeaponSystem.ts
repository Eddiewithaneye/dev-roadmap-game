import * as Phaser from "phaser";

import type { Weapon } from "@/types/weapon";
import type { EnemyActor } from "@/game/phaser/objects/EnemyActor";
import type { PlayerActor } from "@/game/phaser/objects/PlayerActor";
import { WeaponEffects } from "@/game/phaser/effects/WeaponEffects";

export class WeaponSystem {
  private readyAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly weapon: Weapon,
    private readonly player: PlayerActor,
    private readonly enemy: EnemyActor,
  ) {}

  tryFire(time: number) {
    if (time < this.readyAt) {
      return;
    }

    this.readyAt = time + this.weapon.cooldown * 1000;
    WeaponEffects.spark(this.scene, this.player.container, this.enemy.container);
  }
}
