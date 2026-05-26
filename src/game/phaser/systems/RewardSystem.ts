import * as Phaser from "phaser";

import { REWARDS } from "@/game/config/rewards";
import { XpPickup } from "@/game/phaser/objects/XpPickup";

export class RewardSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  spawnDefaultReward(x: number, y: number) {
    return new XpPickup(this.scene, x, y, REWARDS[0].xp);
  }
}
