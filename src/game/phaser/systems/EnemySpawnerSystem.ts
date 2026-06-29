export type EnemySpawnRequest = {
  enemyId: "syntax-gremlin" | "spacing-wisp" | "null-wraith-miniboss";
  count: number;
  isMiniBoss?: boolean;
};

type SpawnWave = EnemySpawnRequest & {
  atMs: number;
};

const FIRST_LEVEL_WAVES: SpawnWave[] = [
  { atMs: 1000, enemyId: "spacing-wisp", count: 1 },
  { atMs: 9000, enemyId: "syntax-gremlin", count: 2 },
  { atMs: 18000, enemyId: "spacing-wisp", count: 1 },
  { atMs: 18000, enemyId: "syntax-gremlin", count: 1 },
  { atMs: 30000, enemyId: "spacing-wisp", count: 2 },
  { atMs: 30000, enemyId: "syntax-gremlin", count: 2 },
  { atMs: 43000, enemyId: "spacing-wisp", count: 2 },
  { atMs: 56000, enemyId: "syntax-gremlin", count: 3 },
  { atMs: 72000, enemyId: "spacing-wisp", count: 2 },
  { atMs: 86000, enemyId: "syntax-gremlin", count: 3 },
  { atMs: 102000, enemyId: "spacing-wisp", count: 3 },
  { atMs: 118000, enemyId: "syntax-gremlin", count: 3 },
  { atMs: 134000, enemyId: "spacing-wisp", count: 4 },
  { atMs: 145000, enemyId: "syntax-gremlin", count: 4 },
  { atMs: 150000, enemyId: "null-wraith-miniboss", count: 1, isMiniBoss: true },
  { atMs: 162000, enemyId: "syntax-gremlin", count: 3 },
  { atMs: 174000, enemyId: "spacing-wisp", count: 2 },
];

export class EnemySpawnerSystem {
  private nextWaveIndex = 0;

  update(elapsedMs: number): EnemySpawnRequest[] {
    const readyWaves: EnemySpawnRequest[] = [];

    while (
      this.nextWaveIndex < FIRST_LEVEL_WAVES.length &&
      elapsedMs >= FIRST_LEVEL_WAVES[this.nextWaveIndex].atMs
    ) {
      const wave = FIRST_LEVEL_WAVES[this.nextWaveIndex];
      readyWaves.push({
        enemyId: wave.enemyId,
        count: wave.count,
        isMiniBoss: wave.isMiniBoss,
      });
      this.nextWaveIndex += 1;
    }

    return readyWaves;
  }

  skipToElapsed(elapsedMs: number) {
    while (
      this.nextWaveIndex < FIRST_LEVEL_WAVES.length &&
      FIRST_LEVEL_WAVES[this.nextWaveIndex].atMs < elapsedMs
    ) {
      this.nextWaveIndex += 1;
    }
  }

  reset() {
    this.nextWaveIndex = 0;
  }
}
