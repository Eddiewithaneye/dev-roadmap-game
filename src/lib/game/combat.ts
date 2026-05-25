// this file will Store reusable combat logic.
import { Weapon } from "@/types/weapon";

/**
 * Represents an enemy or boss in the game.
 */
export type Enemy = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  type: "minion" | "boss";
};

/**
 * Result of an attack action.
 */
export type AttackResult = {
  damageDealt: number;
  enemyHealth: number;
  isEnemyDefeated: boolean;
  newCooldownReadyAt: number;
};

/**
 * Check if a weapon attack is ready to fire.
 * @param readyAt Timestamp when the weapon is ready (milliseconds)
 * @param now Current timestamp (milliseconds)
 * @returns true if ready, false if still on cooldown
 */
export function canAttack(readyAt: number, now: number): boolean {
  return now >= readyAt;
}

/**
 * Calculate remaining cooldown time in seconds.
 * @param readyAt Timestamp when the weapon is ready (milliseconds)
 * @param now Current timestamp (milliseconds)
 * @returns Seconds remaining, clamped to 0
 */
export function getCooldownRemaining(readyAt: number, now: number): number {
  return Math.max(0, Math.ceil((readyAt - now) / 1000));
}

/**
 * Calculate the next cooldown ready time based on weapon cooldown.
 * @param weapon The weapon being used
 * @param now Current timestamp (milliseconds)
 * @returns Timestamp when weapon will be ready again
 */
export function getNextReadyTime(weapon: Weapon, now: number): number {
  return now + weapon.cooldown * 1000;
}

/**
 * Apply weapon damage to an enemy.
 * @param weapon The weapon attacking
 * @param enemy The enemy being attacked
 * @returns Updated enemy with reduced health
 */
export function damageEnemy(weapon: Weapon, enemy: Enemy): Enemy {
  return {
    ...enemy,
    health: Math.max(0, enemy.health - weapon.damage),
  };
}

/**
 * Execute a full attack: damage the enemy and calculate cooldown.
 * @param weapon The weapon attacking
 * @param enemy The enemy being attacked
 * @param now Current timestamp (milliseconds)
 * @returns Attack result including updated enemy state and cooldown
 */
export function attackEnemy(
  weapon: Weapon,
  enemy: Enemy,
  now: number
): AttackResult {
  const damagedEnemy = damageEnemy(weapon, enemy);
  const isDefeated = damagedEnemy.health === 0;

  return {
    damageDealt: weapon.damage,
    enemyHealth: damagedEnemy.health,
    isEnemyDefeated: isDefeated,
    newCooldownReadyAt: getNextReadyTime(weapon, now),
  };
}

/**
 * Check if an enemy is defeated.
 * @param enemy The enemy to check
 * @returns true if health is 0 or less
 */
export function isEnemyDefeated(enemy: Enemy): boolean {
  return enemy.health <= 0;
}

/**
 * Create a default boss enemy.
 * @returns A new boss with full health
 */
export function spawnBoss(): Enemy {
  return {
    id: "boss-1",
    name: "Data Colossus",
    health: 120,
    maxHealth: 120,
    type: "boss",
  };
}
