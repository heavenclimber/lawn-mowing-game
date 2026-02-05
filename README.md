# 🌱 Lawn Mowing Game

A casual HTML5 game built with Phaser 3 featuring a bird's eye view lawn mowing experience with a built-in level editor!

## 🎮 Features

- **Simple Controls**: Use Arrow Keys or WASD to move your mower
- **Satisfying Gameplay**: Mow all the grass and watch your progress in real-time
- **Obstacles**: Navigate around trees, flowers, and garden gnomes
- **Level Editor**: Create and save your own custom levels
- **Cartoonish Art**: Bright, colorful, and casual visual style
- **Progress Tracking**: See your completion percentage and time

## 🚀 How to Play

### Running the Game

The game requires a local web server due to Phaser 3's asset loading:

**Option 1: Using npx (recommended)**
```bash
cd mowing-game
npx serve -p 8080
```

**Option 2: Using Python**
```bash
cd mowing-game
python3 -m http.server 8080
```

Then open your browser to: `http://localhost:8080`

### Controls

- **Arrow Keys** or **WASD**: Move the lawn mower
- **Mouse**: Navigate menus and use the level editor

### Objective

Mow 100% of the grass while avoiding obstacles. The grass changes from dark green (unmowed) to light green with stripes (mowed) as you pass over it.

## 🛠️ Level Editor

1. Click **EDITOR** from the main menu
2. Select a tool: Tree, Flower, Gnome, or Eraser
3. Click on grid tiles to place or remove obstacles
4. Click **SAVE** to store your custom level
5. Click **BACK** and then **PLAY** to try your level!

Your custom levels are saved in your browser's localStorage.

## 🎨 Assets

All game assets were custom-generated with a cartoonish, casual aesthetic:
- Cute lawn mower sprite
- Unmowed and mowed grass textures
- Colorful obstacles (trees, flowers, gnomes)
- Friendly UI elements

## 📁 Project Structure

```
mowing-game/
├── index.html          # Main game file
├── css/
│   └── style.css      # Game styling
├── js/
│   ├── game.js        # Phaser configuration
│   ├── menuScene.js   # Main menu
│   ├── mainScene.js   # Gameplay scene
│   └── editorScene.js # Level editor
└── assets/
    ├── sprites/       # Character sprites
    ├── tiles/         # Grass textures
    ├── obstacles/     # Obstacle images
    └── ui/           # UI elements
```

## 🔧 Technical Details

- **Framework**: Phaser 3.60.0
- **Physics**: Arcade Physics (top-down, no gravity)
- **Grid System**: 20x15 tiles (40px each)
- **Canvas Size**: 800x600
- **Persistence**: Browser localStorage for custom levels

## 🎯 Future Enhancements

- Sound effects and background music
- Multiple pre-made levels
- Time-based challenges
- Power-ups and special abilities
- Mobile touch controls
- Leaderboard system

## 📝 Notes

- The game uses procedurally generated graphics as placeholders
- Custom levels persist across sessions
- CORS restrictions require a local server (cannot use file:// protocol)

---

Enjoy mowing! 🌿
