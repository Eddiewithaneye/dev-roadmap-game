// import eq so we can filter by user id
import { eq } from "drizzle-orm";

// import the database connection
import { db } from "./index";

// import the player progress table
import { playerProgress } from "./schema";

// describe the safe progress shape the app can use
export type PublicPlayerProgress = {
  cred: number;
  unlockedLanguages: string[];
  unlockedConcepts: string[];
  permanentUpgradeLevels: Record<string, number>;
};

// define default progress for a new player with no saved row yet
export const DEFAULT_PLAYER_PROGRESS: PublicPlayerProgress = {
  cred: 0,
  unlockedLanguages: [],
  unlockedConcepts: [],
  permanentUpgradeLevels: {},
};

// get saved progress for one player
export async function getPlayerProgress(userId: string) {
  const rows = await db
    .select()
    .from(playerProgress)
    .where(eq(playerProgress.userId, userId));

  return rows[0] ?? null;
}

// convert a database row into safe API response data
export function toPublicPlayerProgress(
  progress: typeof playerProgress.$inferSelect,
): PublicPlayerProgress {
  return {
    cred: progress.cred,
    unlockedLanguages: progress.unlockedLanguages,
    unlockedConcepts: progress.unlockedConcepts,
    permanentUpgradeLevels: progress.permanentUpgradeLevels,
  };
}