const Game = {
    lastTime: 0,

    gameLoop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    },

    update(deltaTime) {
        switch(this.currentScreen) {
            case 'title':
                break;
            case 'dungeon':
                Dungeon.update(deltaTime);
                Character.update(deltaTime);
                // プレイヤーが階段に乗ったかチェック
                const playerX = Math.floor(Character.player.x);
                const playerY = Math.floor(Character.player.y);
                if (Dungeon.grid[playerY][playerX] === 'tile9') {
                    this.regenerateDungeon();
                }
                break;
            case 'battle':
                Battle.update(deltaTime);
                break;
        }
    },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentScreen = 'title';
        this.floor = 1;
        this.lastTime = performance.now();
        
        Graphics.init(this.ctx);
        Input.init();
        Sound.init();
        Character.init();
        Dungeon.init();
        
        this.gameLoop(this.lastTime);
    },
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        switch(this.currentScreen) {
            case 'title':
                Graphics.drawTitle();
                break;
            case 'dungeon':
                Dungeon.render();
                Character.render();
                Graphics.drawStatusBars(Character.player);
                Graphics.drawFloorNumber(this.floor);
                break;
            case 'battle':
                Battle.render();
                break;
        }
    },

    startGame() {
        console.log("Game started!");
        this.currentScreen = 'dungeon';
        Sound.playBGM('dungeon');
    },

    regenerateDungeon() {
        Dungeon.init();
        Dungeon.spawnEnemies();
        this.floor++;
        console.log(`Descended to floor ${this.floor}`);
    },
};

window.addEventListener('load', () => {
    Game.init();
});