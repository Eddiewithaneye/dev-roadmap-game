"use client";

import { useEffect, useRef } from "react";

type PhaserGame = {
  destroy: (removeCanvas: boolean, noReturn?: boolean) => void;
};

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PhaserGame | null>(null);

  useEffect(() => {
    let isUnmounted = false;

    async function mountGame() {
      const [{ default: Phaser }, { default: GameScene }] = await Promise.all([
        import("phaser"),
        import("@/game/phaser/scenes/GameScene"),
      ]);

      if (isUnmounted || !containerRef.current || gameRef.current) {
        return;
      }

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 960,
        height: 540,
        backgroundColor: "#101827",
        scene: [GameScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });
    }

    void mountGame();

    return () => {
      isUnmounted = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-950 shadow-2xl shadow-cyan-950/30">
      <div ref={containerRef} className="h-full min-h-[360px] w-full" />
    </div>
  );
}
