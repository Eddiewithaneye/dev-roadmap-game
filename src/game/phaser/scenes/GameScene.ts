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

    this.cameras.main.setBackgroundColor("#101827");

    this.add
      .text(480, 56, "Codebound", {
        color: "#e0f2fe",
        fontFamily: "monospace",
        fontSize: "32px",
      })
      .setOrigin(0.5);

    this.add
      .text(480, 104, "Phaser is rendering inside Next.js", {
        color: "#67e8f9",
        fontFamily: "monospace",
        fontSize: "18px",
      })
      .setOrigin(0.5);

    const battlefield = this.add.graphics();
    battlefield.fillStyle(0x172033, 1);
    battlefield.fillRoundedRect(96, 148, 768, 300, 18);
    battlefield.lineStyle(2, 0x22d3ee, 0.35);
    battlefield.strokeRoundedRect(96, 148, 768, 300, 18);

    const player = this.add.rectangle(300, 304, 74, 104, 0x38bdf8);
    player.setStrokeStyle(4, 0xe0f2fe);

    this.add
      .text(300, 380, "Fantasy-tech coder", {
        color: "#e0f2fe",
        fontFamily: "monospace",
        fontSize: "16px",
      })
      .setOrigin(0.5);

    const target = this.add.rectangle(660, 304, 82, 96, 0xf97316);
    target.setStrokeStyle(4, 0xffedd5);

    this.add
      .text(660, 380, enemy.name, {
        color: "#ffedd5",
        fontFamily: "monospace",
        fontSize: "16px",
      })
      .setOrigin(0.5);

    this.add
      .text(480, 480, `${language.name} weapon ready | ${enemy.health} HP target`, {
        color: "#bae6fd",
        fontFamily: "monospace",
        fontSize: "18px",
      })
      .setOrigin(0.5);
  }
}
