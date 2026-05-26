import * as Phaser from "phaser";

import { enemies } from "@/data/enemies";
import { languages } from "@/data/languages";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    const language = languages[0];
    const enemy = enemies[0];
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;
    const battlefieldWidth = Math.min(width * 0.78, 920);
    const battlefieldHeight = Math.min(height * 0.42, 340);
    const battlefieldX = centerX - battlefieldWidth / 2;
    const battlefieldY = centerY - battlefieldHeight / 2;
    const playerX = centerX - battlefieldWidth * 0.24;
    const enemyX = centerX + battlefieldWidth * 0.24;
    const actorY = centerY;

    this.cameras.main.setBackgroundColor("#101827");

    this.add
      .text(centerX, 112, "Codebound", {
        color: "#e0f2fe",
        fontFamily: "monospace",
        fontSize: "32px",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 156, "Phaser is rendering inside Next.js", {
        color: "#67e8f9",
        fontFamily: "monospace",
        fontSize: "18px",
      })
      .setOrigin(0.5);

    const battlefield = this.add.graphics();
    battlefield.fillStyle(0x172033, 1);
    battlefield.fillRoundedRect(
      battlefieldX,
      battlefieldY,
      battlefieldWidth,
      battlefieldHeight,
      18,
    );
    battlefield.lineStyle(2, 0x22d3ee, 0.35);
    battlefield.strokeRoundedRect(
      battlefieldX,
      battlefieldY,
      battlefieldWidth,
      battlefieldHeight,
      18,
    );

    const player = this.add.rectangle(playerX, actorY, 74, 104, 0x38bdf8);
    player.setStrokeStyle(4, 0xe0f2fe);

    this.add
      .text(playerX, actorY + 76, "Fantasy-tech coder", {
        color: "#e0f2fe",
        fontFamily: "monospace",
        fontSize: "16px",
      })
      .setOrigin(0.5);

    const target = this.add.rectangle(enemyX, actorY, 82, 96, 0xf97316);
    target.setStrokeStyle(4, 0xffedd5);

    this.add
      .text(enemyX, actorY + 76, enemy.name, {
        color: "#ffedd5",
        fontFamily: "monospace",
        fontSize: "16px",
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        battlefieldY + battlefieldHeight + 42,
        `${language.name} weapon ready | ${enemy.health} HP target`,
        {
          color: "#bae6fd",
          fontFamily: "monospace",
          fontSize: "18px",
        },
      )
      .setOrigin(0.5);
  }
}
