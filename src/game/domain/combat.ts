import { ENEMIES } from "@/game/config/enemies";
import type { Weapon } from "@/types/weapon";

import { clampHealth, isDefeated } from "./health";
import type { AttackResult, Enemy } from "./types";

export function canAttack(readyAt: number, now: number): boolean {
  return now >= readyAt;
}

export function getCooldownRemaining(readyAt: number, now: number): number {
  return Math.max(0, Math.ceil((readyAt - now) / 1000));
}

export function getNextReadyTime(weapon: Weapon, now: number): number {
  return now + weapon.cooldown * 1000;
}

export function damageEnemy(weapon: Weapon, enemy: Enemy): Enemy {
  return {
    ...enemy,
    health: clampHealth(enemy.health - weapon.damage, enemy.maxHealth),
  };
}

export function attackEnemy(
  weapon: Weapon,
  enemy: Enemy,
  now: number,
): AttackResult {
  const damagedEnemy = damageEnemy(weapon, enemy);
  const defeated = isDefeated(damagedEnemy.health);

  return {
    damageDealt: weapon.damage,
    enemyHealth: damagedEnemy.health,
    isEnemyDefeated: defeated,
    newCooldownReadyAt: getNextReadyTime(weapon, now),
    xpReward: defeated ? enemy.xpReward : 0,
  };
}

export function spawnEnemy(enemyId = ENEMIES[0].id): Enemy {
  const definition =
    ENEMIES.find((enemy) => enemy.id === enemyId) ?? ENEMIES[0];

  return {
    id: definition.id,
    name: definition.name,
    health: definition.health,
    maxHealth: definition.health,
    speed: definition.speed,
    damage: definition.damage,
    category: definition.category,
    xpReward: definition.xpReward,
  };
}
