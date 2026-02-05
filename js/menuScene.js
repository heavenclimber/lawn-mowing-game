class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    // Background
    this.add.rectangle(400, 300, 800, 600, 0x87ceeb);

    // Title
    this.add
      .text(400, 150, "LAWN MOWING GAME", {
        fontSize: "48px",
        fontFamily: "Arial Black",
        color: "#2E7D32",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // PLAY button
    const playButton = this.add
      .rectangle(400, 280, 200, 60, 0x4caf50)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(400, 280, "PLAY", {
        fontSize: "32px",
        fontFamily: "Arial Black",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    playButton.on("pointerover", () => {
      playButton.setFillStyle(0x66bb6a);
    });

    playButton.on("pointerout", () => {
      playButton.setFillStyle(0x4caf50);
    });

    playButton.on("pointerdown", () => {
      this.startGame();
    });

    // EDITOR button
    const editorButton = this.add
      .rectangle(400, 370, 200, 60, 0xff9800)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(400, 370, "EDITOR", {
        fontSize: "32px",
        fontFamily: "Arial Black",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    editorButton.on("pointerover", () => {
      editorButton.setFillStyle(0xffb74d);
    });

    editorButton.on("pointerout", () => {
      editorButton.setFillStyle(0xff9800);
    });

    editorButton.on("pointerdown", () => {
      this.scene.start("EditorScene");
    });

    // Instructions
    this.add
      .text(400, 480, "Use Arrow Keys or WASD to move", {
        fontSize: "20px",
        color: "#333333",
      })
      .setOrigin(0.5);

    this.add
      .text(400, 520, "Mow all the grass to win!", {
        fontSize: "20px",
        color: "#333333",
      })
      .setOrigin(0.5);
  }

  startGame() {
    // 🔓 SAFE audio unlock + start
    if (this.sound.locked) {
      this.sound.once("unlocked", () => {
        this.playMusicAndStart();
      });
      this.sound.unlock();
    } else {
      this.playMusicAndStart();
    }
  }

  playMusicAndStart() {
    if (!this.bgm) {
      this.bgm = this.sound.add("bgm", {
        loop: true,
        volume: 0.5,
      });
      this.bgm.play();
    }

    this.scene.start("MainScene");
  }
}
