import Phaser from "phaser";

export type HitIntensity = "light" | "normal" | "heavy";

type DamageNumberOptions = {
    intensity?: HitIntensity;
}

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

export function spawnDamageNumber(
    scene: Phaser.Scene,
    x: number,
    y: number,
    amount: number,
    options: DamageNumberOptions = {}
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