import { GameCanvas } from "@/components/game/GameCanvas";

export const metadata = {
  title: "Codebound",
};

export default function GamePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#08111f] px-4 py-6 text-zinc-50 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
        <header className="flex flex-col gap-1">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
            Milestone 1
          </p>
          <h1 className="text-2xl font-semibold">Codebound</h1>
        </header>
        <GameCanvas />
      </div>
    </main>
  );
}
