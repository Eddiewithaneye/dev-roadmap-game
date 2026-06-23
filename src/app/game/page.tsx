import {auth} from "@/auth";
import { GameShell } from "@/components/game-shell";
import { GameCanvas } from "@/components/game/GameCanvas";
import { getOrCreatePlayerProfile } from "@/lib/db/playerProfiles";


export const metadata = {
  title: "Codebound",
};

export default async function GamePage() {
  const session = await auth();

  if(session?.user?.id){
    await getOrCreatePlayerProfile(
      session.user.id,
      session.user.name ?? session.user.email ?? "Developer",
    );
  }

  return (
    <GameShell>
      <GameCanvas />
    </GameShell>
  );
}
