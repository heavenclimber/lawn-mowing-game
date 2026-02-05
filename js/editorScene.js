class EditorScene extends Phaser.Scene {
  constructor() {
    super({ key: "EditorScene" });

    // CONFIG
    this.TILE_SIZE = 40;
    this.GRID_W = 20;
    this.GRID_H = 20;

    this.TOOLS = ["tree", "rock", "gnome", "flower", "erase"];
    this.selectedTool = "tree";

    this.grid = [];
    this.toolButtons = [];
  }

  preload() {
    this.load.image("grass", "assets/tiles/grass_unmowed.png");

    this.load.image("tree", "assets/obstacles/tree.png");
    this.load.image("rock", "assets/obstacles/rock.png");
    this.load.image("gnome", "assets/obstacles/gnome.png");
    this.load.image("flower", "assets/obstacles/flower.png");
  }

  create() {
    this.createHeader();
    this.createGrid();

    // camera bounds = grid size
    this.cameras.main.setBounds(
      0,
      0,
      this.GRID_W * this.TILE_SIZE,
      this.GRID_H * this.TILE_SIZE,
    );

    // hover highlight (created ONCE)
    this.hoverRect = this.add.rectangle(
      0,
      0,
      this.TILE_SIZE,
      this.TILE_SIZE,
      0xffff00,
      0.25,
    );
    this.hoverRect.setStrokeStyle(2, 0xffff00);
    this.hoverRect.setVisible(false);

    this.createToolbar();
    this.createButtons();
    this.loadLevel();

    /* =========================
        INPUT (EVENT-DRIVEN)
    ========================== */

    // place obstacle
    this.input.on("pointerdown", (pointer) => {
      const gx = Math.floor(pointer.worldX / this.TILE_SIZE);
      const gy = Math.floor(pointer.worldY / this.TILE_SIZE);

      if (gx < 0 || gy < 0 || gx >= this.GRID_W || gy >= this.GRID_H) return;

      this.applyTool(gx, gy);
    });

    // hover preview
    this.input.on("pointermove", (pointer) => {
      this.updateHoverTile(pointer);
    });

    // throttled scroll
    this.lastWheelTime = 0;
    this.input.on("wheel", (pointer, _, __, dy) => {
      const now = this.time.now;
      if (now - this.lastWheelTime < 16) return;
      this.lastWheelTime = now;

      const cam = this.cameras.main;
      cam.scrollY = Phaser.Math.Clamp(
        cam.scrollY + dy * 0.4,
        0,
        this.GRID_H * this.TILE_SIZE - cam.height,
      );
    });
  }

  /* =========================
      HEADER
  ========================== */
  createHeader() {
    this.add
      .text(400, 20, "LEVEL EDITOR", {
        fontSize: "32px",
        fontFamily: "Arial Black",
        color: "#2E7D32",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  /* =========================
      GRID
  ========================== */
  createGrid() {
    const grassScale = this.TILE_SIZE / 128;

    for (let y = 0; y < this.GRID_H; y++) {
      this.grid[y] = [];

      for (let x = 0; x < this.GRID_W; x++) {
        const px = x * this.TILE_SIZE + this.TILE_SIZE / 2;
        const py = y * this.TILE_SIZE + this.TILE_SIZE / 2;

        this.add.image(px, py, "grass").setScale(grassScale);

        const g = this.add.graphics();
        g.lineStyle(1, 0x000000, 0.15);
        g.strokeRect(
          px - this.TILE_SIZE / 2,
          py - this.TILE_SIZE / 2,
          this.TILE_SIZE,
          this.TILE_SIZE,
        );

        this.grid[y][x] = null;
      }
    }
  }

  /* =========================
      TOOLBAR
  ========================== */
  createToolbar() {
    const tools = [
      { key: "tree", color: 0x4caf50 },
      { key: "rock", color: 0x9e9e9e },
      { key: "gnome", color: 0xff9800 },
      { key: "flower", color: 0xe91e63 },
      { key: "erase", color: 0xf44336 },
    ];

    const startX = 200;
    const y = 90;
    const spacing = 90;
    const radius = 32;

    tools.forEach((tool, i) => {
      const x = startX + i * spacing;

      const bg = this.add
        .circle(
          x,
          y,
          radius,
          tool.color,
          tool.key === this.selectedTool ? 1 : 0.5,
        )
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0);

      let icon;
      if (tool.key === "erase") {
        icon = this.add
          .text(x, y, "✕", {
            fontSize: "32px",
            fontFamily: "Arial Black",
            color: "#fff",
          })
          .setOrigin(0.5)
          .setScrollFactor(0);
      } else {
        icon = this.add.image(x, y, tool.key);
        icon.setScale((radius * 1.2) / Math.max(icon.width, icon.height));
        icon.setScrollFactor(0);
      }

      bg.on("pointerdown", () => {
        this.selectedTool = tool.key;
        this.updateToolbar();
      });

      bg.toolKey = tool.key;
      bg.bgColor = tool.color;

      this.toolButtons.push(bg);
    });
  }

  updateToolbar() {
    this.toolButtons.forEach((btn) => {
      const selected = btn.toolKey === this.selectedTool;
      btn.setFillStyle(btn.bgColor, selected ? 1 : 0.5);
      btn.setStrokeStyle(selected ? 4 : 3, selected ? 0xffff00 : 0xffffff);
    });
  }

  /* =========================
      HOVER PREVIEW
  ========================== */
  updateHoverTile(pointer) {
    const colors = {
      tree: 0x4caf50,
      rock: 0x9e9e9e,
      gnome: 0xff9800,
      flower: 0xe91e63,
      erase: 0xf44336,
    };

    const gx = Math.floor(pointer.worldX / this.TILE_SIZE);
    const gy = Math.floor(pointer.worldY / this.TILE_SIZE);

    if (gx < 0 || gy < 0 || gx >= this.GRID_W || gy >= this.GRID_H) {
      this.hoverRect.setVisible(false);
      return;
    }

    this.hoverRect.setVisible(true);
    this.hoverRect.setFillStyle(colors[this.selectedTool], 0.25);
    this.hoverRect.setStrokeStyle(2, colors[this.selectedTool]);
    this.hoverRect.setPosition(
      gx * this.TILE_SIZE + this.TILE_SIZE / 2,
      gy * this.TILE_SIZE + this.TILE_SIZE / 2,
    );
  }

  /* =========================
      GRID ACTION
  ========================== */
  applyTool(x, y) {
    if (this.selectedTool === "erase") {
      if (this.grid[y][x]) {
        this.grid[y][x].destroy();
        this.grid[y][x] = null;
      }
      return;
    }

    if (this.grid[y][x]) {
      this.grid[y][x].destroy();
    }

    const px = x * this.TILE_SIZE + this.TILE_SIZE / 2;
    const py = y * this.TILE_SIZE + this.TILE_SIZE / 2;

    const sprite = this.add.image(px, py, this.selectedTool);
    sprite.setScale((this.TILE_SIZE / sprite.width) * 0.7);

    this.grid[y][x] = sprite;
  }

  /* =========================
      BUTTONS
  ========================== */
  createButtons() {
    this.makeButton(650, 80, "SAVE", 0x4caf50, () => this.saveLevel());
    this.makeButton(650, 140, "CLEAR", 0xff5722, () => this.clearLevel());
    this.makeButton(50, 80, "BACK", 0x2196f3, () =>
      this.scene.start("MenuScene"),
    );
  }

  makeButton(x, y, label, color, cb) {
    const btn = this.add
      .rectangle(x, y, 100, 50, color)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);

    this.add
      .text(x, y, label, {
        fontSize: "18px",
        fontFamily: "Arial Black",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    btn.on("pointerdown", cb);
  }

  /* =========================
      SAVE / LOAD
  ========================== */
  saveLevel() {
    const data = [];

    for (let y = 0; y < this.GRID_H; y++) {
      for (let x = 0; x < this.GRID_W; x++) {
        const sprite = this.grid[y][x];
        if (sprite) {
          data.push({ x, y, type: sprite.texture.key });
        }
      }
    }

    localStorage.setItem("customLevel", JSON.stringify(data));
    this.flashMessage("LEVEL SAVED!");
  }

  loadLevel() {
    const raw = localStorage.getItem("customLevel");
    if (!raw) return;

    JSON.parse(raw).forEach(({ x, y, type }) => {
      const px = x * this.TILE_SIZE + this.TILE_SIZE / 2;
      const py = y * this.TILE_SIZE + this.TILE_SIZE / 2;

      const sprite = this.add.image(px, py, type);
      sprite.setScale((this.TILE_SIZE / sprite.width) * 0.7);

      this.grid[y][x] = sprite;
    });
  }

  clearLevel() {
    for (let y = 0; y < this.GRID_H; y++) {
      for (let x = 0; x < this.GRID_W; x++) {
        if (this.grid[y][x]) {
          this.grid[y][x].destroy();
          this.grid[y][x] = null;
        }
      }
    }
  }

  flashMessage(text) {
    const msg = this.add
      .text(400, 300, text, {
        fontSize: "36px",
        fontFamily: "Arial Black",
        color: "#4CAF50",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.time.delayedCall(1200, () => msg.destroy());
  }
}
