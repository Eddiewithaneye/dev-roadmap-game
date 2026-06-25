"use client";

import { useEffect, useRef } from "react";

type PhaserGame = {
  destroy: (removeCanvas: boolean, noReturn?: boolean) => void;
  scale: {
    resize: (width: number, height: number) => void;
  };
};

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PhaserGame | null>(null);

  useEffect(() => {
    let isUnmounted = false;
    let resizeObserver: ResizeObserver | null = null;

    async function mountGame() {
      const [{ default: Phaser }, { default: GameScene }] = await Promise.all([
        import("phaser"),
        import("@/game/phaser/scenes/GameScene"),
      ]);

      if (isUnmounted || !containerRef.current || gameRef.current) {
        return;
      }

      const { clientWidth, clientHeight } = containerRef.current;

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: clientWidth,
        height: clientHeight,
        backgroundColor: "#101827",
        scene: [GameScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.NO_CENTER,
        },
      });

      gameRef.current = game;

      resizeObserver = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;

        game.scale.resize(Math.floor(width), Math.floor(height));
      });
      resizeObserver.observe(containerRef.current);
    }

    void mountGame();

    return () => {
      isUnmounted = true;
      resizeObserver?.disconnect();
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="h-full w-full overflow-hidden bg-red-50">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
