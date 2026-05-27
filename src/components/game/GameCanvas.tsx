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

      const { clientWidth, clientHeight } = containerRef.current;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: clientWidth,
        height: clientHeight,
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
    <div className="h-full w-full overflow-hidden bg-slate-950">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
