import { GameShell } from "@/components/game-shell";
import { GameCanvas } from "@/components/game/GameCanvas";

export const metadata = {
  title: "Codebound",
};

export default function GamePage() {
  return (
    <GameShell>
      <GameCanvas />
    </GameShell>
  );
}
