class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x87CEEB);

        // Title
        const title = this.add.text(400, 150, 'LAWN MOWING GAME', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#2E7D32',
            stroke: '#ffffff',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Play button
        const playButton = this.add.rectangle(400, 280, 200, 60, 0x4CAF50);
        playButton.setInteractive({ useHandCursor: true });
        const playText = this.add.text(400, 280, 'PLAY', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        });
        playText.setOrigin(0.5);

        playButton.on('pointerover', () => {
            playButton.setFillStyle(0x66BB6A);
        });

        playButton.on('pointerout', () => {
            playButton.setFillStyle(0x4CAF50);
        });

        playButton.on('pointerdown', () => {
            this.scene.start('MainScene');
        });

        // Editor button
        const editorButton = this.add.rectangle(400, 370, 200, 60, 0xFF9800);
        editorButton.setInteractive({ useHandCursor: true });
        const editorText = this.add.text(400, 370, 'EDITOR', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        });
        editorText.setOrigin(0.5);

        editorButton.on('pointerover', () => {
            editorButton.setFillStyle(0xFFB74D);
        });

        editorButton.on('pointerout', () => {
            editorButton.setFillStyle(0xFF9800);
        });

        editorButton.on('pointerdown', () => {
            this.scene.start('EditorScene');
        });

        // Instructions
        this.add.text(400, 480, 'Use Arrow Keys or WASD to move', {
            fontSize: '20px',
            color: '#333333'
        }).setOrigin(0.5);

        this.add.text(400, 520, 'Mow all the grass to win!', {
            fontSize: '20px',
            color: '#333333'
        }).setOrigin(0.5);
    }
}
