import { eq } from "drizzle-orm";
import { db } from "./index"
import { playerProfiles } from "./schema";

export async function getPlayerProfile(userId:string){
    const rows = await db
    .select()
    .from(playerProfiles)
    .where(eq(playerProfiles.userId, userId));
    return rows[0] ?? null;
}

export async function insertPlayerProfile(
    userId:string,
    displayName:string
) {
    const rows = await db
    .insert(playerProfiles)
    .values({
        userId: userId,
        displayName: displayName
    })
    .returning();

    return rows[0];
}

export async function getOrCreatePlayerProfile(
    userId:string,
    displayName: string,
) {
    const existingProfile = await getPlayerProfile(userId);

    if (existingProfile){
        return existingProfile;
    }

    const createdProfile = await insertPlayerProfile(userId,displayName);
    return createdProfile;
}