class LoaderScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoaderScene" });
  }

  preload() {
    const { width, height } = this.scale;

    // background
    this.cameras.main.setBackgroundColor("#2ecc71");

    // loading text
    const loadingText = this.add
      .text(width / 2, height / 2 - 40, "LOADING...", {
        fontSize: "24px",
        fontFamily: "Arial Black",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // progress box
    const box = this.add.graphics();
    box.fillStyle(0x000000, 0.3);
    box.fillRect(width / 2 - 160, height / 2, 320, 30);

    // progress bar
    const bar = this.add.graphics();

    // percent text
    const percentText = this.add
      .text(width / 2, height / 2 + 50, "0%", {
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // loader events
    this.load.on("progress", (value) => {
      bar.clear();
      bar.fillStyle(0xffffff, 1);
      bar.fillRect(width / 2 - 150, height / 2 + 5, 300 * value, 20);

      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on("complete", () => {
      bar.destroy();
      box.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 🔥 LOAD ALL ASSETS HERE (IMPORTANT)
    this.loadAssets();
  }

  loadAssets() {
    this.load.image("water", "assets/tiles/water.png");
    this.load.image("grass", "assets/tiles/grass_unmowed.png");
    this.load.image("grassMowed", "assets/tiles/grass_mowed.png");
    this.load.image("mower", "assets/sprites/mower.png");
    this.load.image("tree", "assets/obstacles/tree.png");
    this.load.image("flower", "assets/obstacles/flower.png");
    this.load.image("rock", "assets/obstacles/rock.png");
    this.load.image("gnome", "assets/obstacles/gnome.png");

    this.load.audio("bgm", "assets/music/music.mp3");
    this.load.audio("crash", "assets/sfx/crash.mp3");
    this.load.audio("waterHit", "assets/sfx/water.mp3");
    this.load.audio("mower", "assets/sfx/mower.mp3");
    this.load.audio("win", "assets/sfx/win.mp3");
  }

  create() {
    // small delay feels nicer
    this.time.delayedCall(300, () => {
      this.scene.start("MenuScene");
    });
  }
}
