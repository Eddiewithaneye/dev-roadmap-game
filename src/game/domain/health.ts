export function clampHealth(health: number, maxHealth: number) {
  return Math.min(maxHealth, Math.max(0, health));
}

export function isDefeated(health: number) {
  return health <= 0;
}
