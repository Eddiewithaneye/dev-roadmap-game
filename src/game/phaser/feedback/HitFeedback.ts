import Phaser from "phaser";

import type { ScreenShakeIntensity } from "@/types/weapon";

export type HitIntensity = "light" | "normal" | "heavy";

type DamageNumberOptions = {
  intensity?: HitIntensity;
};

type HitFeedbackTarget = Phaser.GameObjects.GameObject & {
  alpha: number;
  scaleX: number;
  scaleY: number;
};

const damageNumberStyles = {
  light: {
    fontSize: "14px",
    color: "#d7f7ff",
    rise: 20,
    duration: 450,
    scaleFrom: 0.9,
  },
  normal: {
    fontSize: "16px",
    color: "#ffffff",
    rise: 28,
    duration: 550,
    scaleFrom: 1,
  },
  heavy: {
    fontSize: "24px",
    color: "#ffd166",
    rise: 42,
    duration: 700,
    scaleFrom: 1.25,
  },
};

const hitShakeStyles: Record<Exclude<ScreenShakeIntensity, "none">, {
  duration: number;
  intensity: number;
}> = {
  light: {
    duration: 45,
    intensity: 0.002,
  },
  normal: {
    duration: 80,
    intensity: 0.004,
  },
  heavy: {
    duration: 140,
    intensity: 0.007,
  },
};

export function spawnDamageNumber(
  scene: Phaser.Scene,
  x: number,
  y: number,
  amount: number,
  options: DamageNumberOptions = {},
) {
  const intensity = options.intensity ?? "normal";
  const style = damageNumberStyles[intensity];
  const text = scene.add.text(x, y, String(amount), {
    fontFamily: "monospace",
    fontSize: style.fontSize,
    color: style.color,
    stroke: "#111111",
    strokeThickness: 3,
  });

  text.setOrigin(0.5);
  text.setScale(style.scaleFrom);
  text.setDepth(1000);

  scene.tweens.add({
    targets: text,
    y: y - style.rise,
    alpha: 0,
    scale: 1,
    duration: style.duration,
    ease: "Quad.easeOut",
    onComplete: () => text.destroy(),
  });
}

export function getHitIntensity(damage: number): HitIntensity {
  if (damage >= 25) {
    return "heavy";
  }

  if (damage <= 5) {
    return "light";
  }

  return "normal";
}

export function playHitShake(
  scene: Phaser.Scene,
  intensity: ScreenShakeIntensity = "normal",
) {
  if (intensity === "none") {
    return;
  }

  const style = hitShakeStyles[intensity];

  scene.cameras.main.shake(style.duration, style.intensity);
}

export function flashHitTarget(
  scene: Phaser.Scene,
  target: HitFeedbackTarget,
  intensity: HitIntensity = "normal",
) {
  const originalAlpha = target.alpha;
  const flashAlpha = intensity === "heavy" ? 0.28 : 0.45;
  const duration = intensity === "heavy" ? 90 : 60;

  scene.tweens.add({
    targets: target,
    alpha: flashAlpha,
    duration,
    yoyo: true,
    ease: "Quad.easeOut",
    onComplete: () => {
      target.alpha = originalAlpha;
    },
  });
}

export function pulseHitTarget(
  scene: Phaser.Scene,
  target: HitFeedbackTarget,
  intensity: HitIntensity = "normal",
) {
  const originalScaleX = target.scaleX;
  const originalScaleY = target.scaleY;
  const scaleAmount = intensity === "heavy" ? 1.12 : 1.06;

  scene.tweens.add({
    targets: target,
    scaleX: originalScaleX * scaleAmount,
    scaleY: originalScaleY * scaleAmount,
    duration: 50,
    yoyo: true,
    ease: "Quad.easeOut",
    onComplete: () => {
      target.scaleX = originalScaleX;
      target.scaleY = originalScaleY;
    },
  });
}
