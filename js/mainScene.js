class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });

    // CONFIG
    this.TILE_SIZE = 40;
    this.WATER_THICKNESS = 5;
    this.GRASS_SIZE = 20;

    this.gridSize = this.WATER_THICKNESS * 2 + this.GRASS_SIZE; // 30

    this.grassData = [];
    this.mowedCount = 0;
    this.totalMowable = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.hasWon = false;
    this.score = 0;
  }

  preload() {
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
    this.hasWon = false;

    this.waterGroup = this.physics.add.staticGroup();
    this.obstacles = this.physics.add.staticGroup();
    this.startTime = this.time.now;

    // 🎵 Background music
    this.bgm = this.sound.add("bgm", {
      loop: true,
      volume: 0.4,
    });

    // 🚜 Mower engine (looped, controlled manually)
    this.mowerSound = this.sound.add("mower", {
      loop: true,
      volume: 0.6,
    });

    // 💥 SFX
    this.crashSound = this.sound.add("crash", { volume: 0.7 });
    this.waterSound = this.sound.add("waterHit", { volume: 0.6 });

    // 🏆 Win SFX
    this.winSound = this.sound.add("win", { volume: 0.8 });

    // autoplay bgm (browser-safe after user interaction)
    this.bgm.play();

    this.buildGrid();
    this.loadCustomLevel();
    this.spawnPlayer();

    // 🧱 CREATE UI TEXTS FIRST
    this.createUI();

    // 🧱 THEN CREATE UI LAYER
    this.uiLayer = this.add.layer().setDepth(1000);

    // 🧱 ADD UI TEXTS INTO UI LAYER
    this.uiLayer.add([this.scoreText, this.timeText]);

    this.createMenuButton();

    // input
    this.cursors = this.input.keyboard.createCursorKeys();

    // collisions
    this.physics.add.collider(this.player, this.waterGroup, () => {
      if (!this.waterSound.isPlaying) {
        this.waterSound.play();
      }
      this.cameras.main.shake(80, 0.004);
    });

    this.physics.add.collider(this.player, this.obstacles, () => {
      if (!this.crashSound.isPlaying) {
        this.crashSound.play();
      }
      this.cameras.main.shake(60, 0.003);
    });

    // camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.gridSize * this.TILE_SIZE,
      this.gridSize * this.TILE_SIZE,
    );

    // physics tuning
    this.physics.world.setBoundsCollision(true, true, true, true);
    this.physics.world.overlapBias = 8;
    this.physics.world.TILE_BIAS = 32;
  }

  /* =========================
      GRID
  ========================== */
  buildGrid() {
    for (let y = 0; y < this.gridSize; y++) {
      this.grassData[y] = [];

      for (let x = 0; x < this.gridSize; x++) {
        const inGrass =
          x >= this.WATER_THICKNESS &&
          x < this.WATER_THICKNESS + this.GRASS_SIZE &&
          y >= this.WATER_THICKNESS &&
          y < this.WATER_THICKNESS + this.GRASS_SIZE;

        const px = x * this.TILE_SIZE + this.TILE_SIZE / 2;
        const py = y * this.TILE_SIZE + this.TILE_SIZE / 2;

        if (inGrass) {
          const sprite = this.add.image(px, py, "grass");
          sprite.setScale(this.TILE_SIZE / sprite.width);

          this.grassData[y][x] = {
            type: "grass",
            mowed: false,
            sprite,
          };

          this.totalMowable++;
        } else {
          const water = this.add.image(px, py, "water");
          water.setScale(this.TILE_SIZE / water.width);

          const block = this.waterGroup.create(px, py, null);
          block.setSize(this.TILE_SIZE, this.TILE_SIZE);
          block.setOffset(-this.TILE_SIZE / 2, -this.TILE_SIZE / 2);
          block.setVisible(false);

          this.grassData[y][x] = { type: "water" };
        }
      }
    }
  }

  createMenuButton() {
    const padding = 12;

    const btn = this.add
      .text(this.cameras.main.width - padding, padding, "MENU", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#00000088",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0) // top-right anchor
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });

    // hover effects
    btn.on("pointerover", () => {
      btn.setStyle({ backgroundColor: "#ffffff", color: "#000000" });
    });

    btn.on("pointerout", () => {
      btn.setStyle({ backgroundColor: "#00000088", color: "#ffffff" });
    });

    // click
    btn.on("pointerdown", () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.sound.stopAll();
        this.scene.start("MenuScene");
      });
    });

    this.uiLayer.add(btn);
  }

  updateMowerBodyOffset() {
    const body = this.player.body;

    const bw = body.width;
    const bh = body.height;

    const sw = this.player.displayWidth;
    const sh = this.player.displayHeight;

    // Perfectly center body first
    const baseX = (sw - bw) / 2;
    const baseY = (sh - bh) / 2;

    // 🔥 PUSH = how much "bulky" part exists
    const push = (sh - bh) / 2; // auto-calculated from sprite

    switch (this.player.angle) {
      case 0: // DOWN
        body.setOffset(baseX, baseY - push);
        break;

      case 180: // UP
        body.setOffset(baseX, baseY + push);
        break;

      case -90: // RIGHT
        body.setOffset(baseX - push, baseY);
        break;

      case 90: // LEFT
        body.setOffset(baseX + push, baseY);
        break;
    }
  }

  placeObstacle(x, y, type) {
    const tile = this.grassData[y]?.[x];
    if (!tile || tile.type !== "grass") return;

    const px = x * this.TILE_SIZE + this.TILE_SIZE / 2;
    const py = y * this.TILE_SIZE + this.TILE_SIZE / 2;

    const obs = this.obstacles.create(px, py, type);
    obs.setScale((this.TILE_SIZE / obs.width) * 0.9);
    obs.setBodySize(this.TILE_SIZE, this.TILE_SIZE);
    obs.setOffset(-this.TILE_SIZE / 2, -this.TILE_SIZE / 2);
    obs.refreshBody();

    tile.type = "blocked";
    tile.mowed = true;
    this.totalMowable--;
  }

  /* =========================
      PLAYER
  ========================== */
  spawnPlayer() {
    const start = this.WATER_THICKNESS * this.TILE_SIZE + this.TILE_SIZE;

    this.player = this.physics.add.sprite(start, start, "mower");
    this.player.setScale(this.TILE_SIZE / this.player.width);
    this.player.setOrigin(0.5, 0.5);
    this.player.setBodySize(this.TILE_SIZE * 0.7, this.TILE_SIZE * 0.7);
  }

  loadCustomLevel() {
    const raw = localStorage.getItem("customLevel");

    if (!raw) return;

    const obstacles = JSON.parse(raw);

    obstacles.forEach(({ x, y, type }) => {
      // SAFETY: skip invalid entries
      if (!this.textures.exists(type)) {
        console.warn("Unknown obstacle type:", type);
        return;
      }

      const worldX = x + this.WATER_THICKNESS;
      const worldY = y + this.WATER_THICKNESS;

      this.placeObstacle(worldX, worldY, type);
    });
  }

  /* =========================
      UPDATE
  ========================== */
  update() {
    const speed = 180;
    this.player.setVelocity(
      this.player.body.velocity.x * 0.9,
      this.player.body.velocity.y * 0.9,
    );

    if (this.hasWon) return;

    // update time HUD
    this.elapsedTime = Math.floor((this.time.now - this.startTime) / 1000);
    this.timeText.setText(`Time: ${this.elapsedTime}s`);

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown) {
      dx = -1;
      this.player.setAngle(90);
    } else if (this.cursors.right.isDown) {
      dx = 1;
      this.player.setAngle(-90);
    }

    if (this.cursors.up.isDown) {
      dy = -1;
      this.player.setAngle(180);
    } else if (this.cursors.down.isDown) {
      dy = 1;
      this.player.setAngle(0);
    }

    this.updateMowerBodyOffset();

    this.player.setVelocity(dx * speed, dy * speed);

    const moving = dx !== 0 || dy !== 0;

    if (moving) {
      if (!this.mowerSound.isPlaying) {
        this.mowerSound.play();
      }
    } else {
      if (this.mowerSound.isPlaying) {
        this.mowerSound.stop();
      }
    }

    this.mow();
  }

  // Faster = higher score, never negative
  calculateTimeBonus() {
    const parTime = 120; // seconds (2 minutes ideal)
    const maxBonus = 5000;

    const bonus = Math.max(
      0,
      Math.floor(((parTime - this.elapsedTime) / parTime) * maxBonus),
    );

    return bonus;
  }

  onWin() {
    // 🔇 stop looping sounds
    if (this.mowerSound.isPlaying) this.mowerSound.stop();
    if (this.bgm.isPlaying) this.bgm.stop();

    this.winSound.play();

    // 🛑 freeze player
    this.player.setVelocity(0);
    this.player.body.enable = false;

    // ⏱️ final time
    const finalTime = this.elapsedTime;
    const timeBonus = this.calculateTimeBonus();

    // 🧮 scoring
    const baseScore = this.totalMowable * 100;
    this.score = baseScore + timeBonus;

    // 🎥 camera juice
    this.cameras.main.stopFollow();
    this.cameras.main.shake(300, 0.006);
    this.cameras.main.zoomTo(1.25, 400, "Sine.easeInOut");

    // screen center (camera-safe)
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    // 🏆 MAIN TEXT
    const title = this.add
      .text(cx, cy - 80, "LAWN COMPLETE!", {
        fontSize: "48px",
        color: "#00ff88",
        stroke: "#003322",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScale(0)
      .setScrollFactor(0)
      .setDepth(1000);

    const timeText = this.add
      .text(cx, cy - 20, `Time: ${finalTime}s`, {
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScrollFactor(0)
      .setDepth(1000);

    const bonusText = this.add
      .text(cx, cy + 20, `Time Bonus: +${timeBonus}`, {
        fontSize: "24px",
        color: "#ffd700",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScrollFactor(0)
      .setDepth(1000);

    const totalText = this.add
      .text(cx, cy + 70, `Total Score: ${this.score}`, {
        fontSize: "28px",
        color: "#00ffcc",
        stroke: "#003344",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScale(0)
      .setScrollFactor(0)
      .setDepth(1000);

    const restartText = this.add
      .text(cx, cy + 120, "Press R to restart", {
        fontSize: "18px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScrollFactor(0)
      .setDepth(1000);

    // add all to UI layer
    this.uiLayer.add([title, timeText, bonusText, totalText, restartText]);

    // ✨ animations
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 500,
      ease: "Back.Out",
    });

    this.tweens.add({
      targets: timeText,
      alpha: 1,
      delay: 400,
      duration: 300,
    });

    this.tweens.add({
      targets: bonusText,
      alpha: 1,
      delay: 650,
      duration: 300,
    });

    this.tweens.add({
      targets: totalText,
      scale: 1,
      delay: 900,
      duration: 400,
      ease: "Back.Out",
    });

    this.tweens.add({
      targets: restartText,
      alpha: 1,
      delay: 1300,
      duration: 300,
    });

    // 🔁 restart
    this.input.keyboard.once("keydown-R", () => {
      this.cameras.main.zoomTo(1, 300);
      this.sound.stopAll();
      this.scene.restart();
    });
  }

  mow() {
    const gx = Math.floor(this.player.x / this.TILE_SIZE);
    const gy = Math.floor(this.player.y / this.TILE_SIZE);

    const tile = this.grassData[gy]?.[gx];
    if (!tile || tile.type !== "grass" || tile.mowed) return;

    tile.mowed = true;
    tile.sprite.setTexture("grassMowed");
    this.mowedCount++;

    const percent = Math.floor((this.mowedCount / this.totalMowable) * 100);
    this.scoreText.setText(`Mowed: ${percent}%`);

    if (percent >= 100 && !this.hasWon) {
      this.hasWon = true;
      this.onWin();
    }
  }

  /* =========================
      UI
  ========================== */
  createUI() {
    this.scoreText = this.add
      .text(10, 10, "Mowed: 0%", {
        fontSize: "20px",
        color: "#fff",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setScrollFactor(0);
    this.timeText = this.add
      .text(10, 40, "Time: 0s", {
        fontSize: "18px",
        color: "#fff",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setScrollFactor(0);
  }
}
