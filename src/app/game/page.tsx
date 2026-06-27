import {auth} from "@/auth";
import { GameShell } from "@/components/game-shell";
import { GameCanvas } from "@/components/game/GameCanvas";
import type { SprintMode } from "@/game/domain/sprint";
import { getOrCreatePlayerProfile } from "@/lib/db/playerProfiles";


export const metadata = {
  title: "Codebound",
};

type GamePageProps = {
  searchParams: Promise<{
    mode?: string | string[];
  }>;
};

export default async function GamePage({ searchParams }: GamePageProps) {
  const session = await auth();
  const modeParam = (await searchParams).mode;
  const initialMode: SprintMode =
    (Array.isArray(modeParam) ? modeParam[0] : modeParam) === "waterfall"
      ? "waterfall"
      : "sprint";

  if(session?.user?.id){
    await getOrCreatePlayerProfile(
      session.user.id,
      session.user.name ?? session.user.email ?? "Developer",
    );
  }

  return (
    <GameShell initialMode={initialMode}>
      <GameCanvas />
    </GameShell>
  );
}
