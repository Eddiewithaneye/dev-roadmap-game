// import the helper that returns JSON responses
import { NextResponse } from "next/server";

// import auth so this endpoint knows who is logged in
import { auth } from "@/auth";

// import progress helpers
import {
  DEFAULT_PLAYER_PROGRESS,
  getPlayerProgress,
  toPublicPlayerProgress,
} from "@/lib/db/playerProgress";

// handle GET /api/player/progress
export async function GET() {
  // ask Auth.js who is logged in
  const session = await auth();

  // reject requests without a logged-in user id
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  // look for saved progress for this logged-in player
  const progress = await getPlayerProgress(session.user.id);

  // if no progress exists yet, return default new-player progress
  if (!progress) {
    return NextResponse.json({
      progress: DEFAULT_PLAYER_PROGRESS,
    });
  }

  // return saved progress as safe JSON data
  return NextResponse.json({
    progress: toPublicPlayerProgress(progress),
  });
}