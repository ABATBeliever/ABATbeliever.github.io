const Dungeon = {
    grid: [],
    width: 0,
    height: 0,
    enemies: [],

    init() {
        const startPosition = this.loadRandomWorld();
        Character.player.x = startPosition.x;
        Character.player.y = startPosition.y;
        this.spawnEnemies();
    },

    loadRandomWorld() {
        const worldIndex = Math.floor(Math.random() * Worlds.length);
        const worldData = Worlds[worldIndex];
        return this.parseWorldData(worldData);
    },

    parseWorldData(data) {
        const lines = data.trim().split('\n');
        this.height = lines.length;
        this.width = lines[0].length;
        this.grid = lines.map(line => 
            line.trim().split('').map(char => {
                const tileNumber = parseInt(char);
                return `tile${tileNumber}`;
            })
        );

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isWalkable(x, y)) {
                    return { x: x + 0.5, y: y + 0.5 };
                }
            }
        }
        return { x: 1.5, y: 1.5 };
    },

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    },

    isWalkable(x, y) {
        if (!this.isValidPosition(x, y)) return false;
        const tileNumber = parseInt(this.grid[Math.floor(y)][Math.floor(x)].slice(4));
        return tileNumber >= 5;
    },

    isWall(x, y) {
        if (!this.isValidPosition(x, y)) return true;
        const tileNumber = parseInt(this.grid[y][x].slice(4));
        return tileNumber >= 0 && tileNumber <= 4;
    },

    spawnEnemies() {
        const enemyCount = 5;
        const availableSpots = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isWalkable(x, y)) {
                    availableSpots.push({x, y});
                }
            }
        }

        this.enemies = [];
        for (let i = 0; i < enemyCount; i++) {
            if (availableSpots.length > 0) {
                const spotIndex = Math.floor(Math.random() * availableSpots.length);
                const spot = availableSpots.splice(spotIndex, 1)[0];
                const enemyType = Object.keys(EnemyTypes)[Math.floor(Math.random() * Object.keys(EnemyTypes).length)];
                
this.enemies.push({
    ...EnemyTypes[enemyType],
    x: spot.x,
    y: spot.y,
    dx: Math.random() * 2 - 1,
    dy: Math.random() * 2 - 1,
    hp: generateEnemyHp(EnemyTypes[enemyType].baseHp),
    maxHp: EnemyTypes[enemyType].baseHp
});
            }
        }
    },

    update(deltaTime) {
        this.enemies.forEach(enemy => {
            const newX = enemy.x + enemy.dx * enemy.speed * deltaTime;
            const newY = enemy.y + enemy.dy * enemy.speed * deltaTime;

            if (this.isWalkable(Math.floor(newX), Math.floor(newY))) {
                enemy.x = newX;
                enemy.y = newY;
            } else {
                enemy.dx = Math.random() * 2 - 1;
                enemy.dy = Math.random() * 2 - 1;
            }
        });

        const playerX = Math.floor(Character.player.x);
        const playerY = Math.floor(Character.player.y);
        
        if (this.isValidPosition(playerX, playerY) && this.grid[playerY][playerX] === 'stairs') {
            Game.regenerateDungeon();
        }
        this.enemies = this.enemies.filter(enemy => enemy.hp > 0);
    },

    render() {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                Graphics.drawTile(x, y, this.grid[y][x]);
            }
        }
        this.enemies.forEach(enemy => {
            Graphics.drawEnemy(enemy);
        });
    }
};