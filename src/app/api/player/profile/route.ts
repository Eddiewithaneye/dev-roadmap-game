// import the helper that creates JSON responses
import { NextResponse } from "next/server";

// import auth so the endpoint can identify the logged-in user
import { auth } from "@/auth";

// import only the read helper
import { getPlayerProfile } from "@/lib/db/playerProfiles";

// make this route run in the Node.js runtime
export const runtime = "nodejs";

// handle GET /api/player/profile
export async function GET() {
  // ask Auth.js who is logged in
  const session = await auth();

  // stop if there is no logged-in user id
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  // get the profile for the logged-in user
  const profile = await getPlayerProfile(session.user.id);

  // return a clear missing-profile response if none exists
  if (!profile) {
    return NextResponse.json(
      { profile: null },
      { status: 404 },
    );
  }

  // return safe public profile data
  return NextResponse.json({
    profile: {
      displayName: profile.displayName,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    },
  });
}