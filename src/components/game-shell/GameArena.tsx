"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ARENA_LAYOUT, type ArenaPercentRect } from "@/lib/game/arena";
import {
  PLAYER_MOVEMENT_TUNING,
  PLAYER_PLACEHOLDER_TUNING,
  type PlayerPosition,
} from "@/lib/game/player";

import { PlaceholderPlayer } from "./PlaceholderPlayer";

const MOVEMENT_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
]);

function getArenaRectStyle(rect: ArenaPercentRect): CSSProperties {
  return {
    left: `${rect.xPercent}%`,
    top: `${rect.yPercent}%`,
    width: `${rect.widthPercent}%`,
    height: `${rect.heightPercent}%`,
  };
}

function getInitialPlayerPosition(): PlayerPosition {
  return {
    xPercent: PLAYER_PLACEHOLDER_TUNING.xPercent,
    groundYPercent: PLAYER_PLACEHOLDER_TUNING.groundYPercent,
    facing: 1,
  };
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "select" ||
    tagName === "textarea"
  );
}

function getMovementVector(keys: Set<string>) {
  const x =
    (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) -
    (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
  const y =
    (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) -
    (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);
  const length = Math.hypot(x, y);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: x / length,
    y: y / length,
  };
}

function clampPlayerPosition(position: PlayerPosition): PlayerPosition {
  const walkableArea = ARENA_LAYOUT.walkableArea;
  const halfPlayerWidthPercent =
    ((PLAYER_PLACEHOLDER_TUNING.widthPx * PLAYER_PLACEHOLDER_TUNING.scale) /
      ARENA_LAYOUT.camera.width) *
    50;
  const minX = walkableArea.xPercent + halfPlayerWidthPercent;
  const maxX =
    walkableArea.xPercent +
    walkableArea.widthPercent -
    halfPlayerWidthPercent;
  const minGroundY = walkableArea.yPercent;
  const maxGroundY = walkableArea.yPercent + walkableArea.heightPercent;

  return {
    xPercent: Math.min(maxX, Math.max(minX, position.xPercent)),
    groundYPercent: Math.min(
      maxGroundY,
      Math.max(minGroundY, position.groundYPercent),
    ),
    facing: position.facing,
  };
}

export function GameArena() {
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>(() =>
    clampPlayerPosition(getInitialPlayerPosition()),
  );
  const playerPositionRef = useRef<PlayerPosition>(playerPosition);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const topHudStyle = {
    height: `${ARENA_LAYOUT.hudSafeZones.topPercent}%`,
  } satisfies CSSProperties;
  const bottomHudStyle = {
    height: `${ARENA_LAYOUT.hudSafeZones.bottomPercent}%`,
  } satisfies CSSProperties;

  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!MOVEMENT_KEYS.has(event.code) || isTypingTarget(event.target)) {
        return;
      }

      event.preventDefault();
      pressedKeysRef.current.add(event.code);
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeysRef.current.delete(event.code);
    }

    function handleWindowBlur() {
      pressedKeysRef.current.clear();
      lastFrameTimeRef.current = null;
    }

    function tick(time: number) {
      const previousTime = lastFrameTimeRef.current ?? time;
      const deltaSeconds = Math.min(0.05, (time - previousTime) / 1000);
      const movement = getMovementVector(pressedKeysRef.current);

      lastFrameTimeRef.current = time;

      if (movement.x !== 0 || movement.y !== 0) {
        const currentPosition = playerPositionRef.current;
        const nextPosition = clampPlayerPosition({
          xPercent:
            currentPosition.xPercent +
            movement.x *
              ((PLAYER_MOVEMENT_TUNING.speedPxPerSecond /
                ARENA_LAYOUT.camera.width) *
                100) *
              deltaSeconds,
          groundYPercent:
            currentPosition.groundYPercent +
            movement.y *
              ((PLAYER_MOVEMENT_TUNING.speedPxPerSecond /
                ARENA_LAYOUT.camera.height) *
                100) *
              deltaSeconds,
          facing:
            movement.x === 0
              ? currentPosition.facing
              : movement.x > 0
                ? 1
                : -1,
        });

        playerPositionRef.current = nextPosition;
        setPlayerPosition(nextPosition);
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section
      aria-label="Code Campus battlefield"
      className="relative min-h-screen overflow-hidden bg-[#071018]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#16294a_0%,#14384f_36%,#0f2230_58%,#071018_100%)]" />

      <div
        className="absolute inset-x-0 top-0 z-[2] bg-black/20"
        data-testid="top-hud-safe-zone"
        style={topHudStyle}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-[2] bg-black/25"
        data-testid="bottom-hud-safe-zone"
        style={bottomHudStyle}
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[13%] h-[25%] bg-[radial-gradient(circle_at_52%_60%,rgba(103,232,249,0.26),transparent_18%),linear-gradient(90deg,rgba(20,184,166,0.08),rgba(168,85,247,0.12),rgba(20,184,166,0.08))]"
        data-arena-layer="sky"
      />
      <div
        aria-hidden="true"
        className="absolute left-[8%] top-[24%] h-[21%] w-[16%] border border-cyan-200/10 bg-cyan-200/[0.04]"
        data-arena-layer="far-ruins"
      />
      <div
        aria-hidden="true"
        className="absolute right-[9%] top-[18%] h-[29%] w-[24%] border border-purple-200/10 bg-purple-200/[0.04]"
        data-arena-layer="far-campus"
      />
      <div
        aria-hidden="true"
        className="absolute left-[28%] top-[33%] h-[12%] w-[46%] border-t border-cyan-200/10 bg-black/10"
        data-arena-layer="midground"
      />

      <div
        className="absolute overflow-hidden border-2 border-cyan-200/35 bg-[linear-gradient(180deg,rgba(15,118,110,0.14),rgba(20,83,45,0.28))] shadow-[inset_0_0_38px_rgba(34,211,238,0.10)]"
        data-testid="walkable-area"
        style={getArenaRectStyle(ARENA_LAYOUT.walkableArea)}
      >
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(165,243,252,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(165,243,252,0.16)_1px,transparent_1px)] [background-size:72px_52px]" />
        <div className="absolute inset-x-0 top-0 h-2 bg-cyan-200/20" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-emerald-200/20" />
        <div className="absolute left-0 top-0 h-full w-2 bg-cyan-200/20" />
        <div className="absolute right-0 top-0 h-full w-2 bg-cyan-200/20" />
        <div className="absolute bottom-[12%] left-[4%] h-px w-[92%] bg-cyan-100/20" />
      </div>

      <PlaceholderPlayer position={playerPosition} />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.62))]"
        data-arena-layer="foreground"
      />
    </section>
  );
}
