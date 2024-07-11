const Graphics = {
    enemyImages: {},

    loadEnemyImages() {
        Object.keys(EnemyTypes).forEach(type => {
            this.enemyImages[type] = new Image();
            this.enemyImages[type].src = EnemyTypes[type].imageSrc;
        });
    },

drawEnemy(enemy) {
    const image = this.enemyImages[enemy.name.toLowerCase()];
    if (image) {
        this.ctx.drawImage(image, (enemy.x - 0.5) * this.tileSize, (enemy.y - 0.5) * this.tileSize, this.tileSize, this.tileSize);
        
        // HPバーの描画
        const hpBarWidth = this.tileSize * 0.8;
        const hpBarHeight = 5;
        const hpBarX = (enemy.x - 0.4) * this.tileSize;
        const hpBarY = (enemy.y - 0.6) * this.tileSize;
        
        // HPバーの背景
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
        
        // HPバー
        const hpRatio = enemy.hp / enemy.maxHp;
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpRatio, hpBarHeight);
    } else {
        console.error(`Enemy image not found for: ${enemy.name}`);
    }
},

    init(ctx) {
        this.ctx = ctx;
        this.tileSize = 32;
        this.loadTileImages();
        this.loadEnemyImages();
    },

    loadTileImages() {
        this.tileImages = {};
        for (let i = 0; i <= 9; i++) {
            this.tileImages[`tile${i}`] = new Image();
            this.tileImages[`tile${i}`].src = `./pic/tile${i}.png`;
        }
    },

    drawTile(x, y, type) {
        const image = this.tileImages[type];
        this.ctx.drawImage(image, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    },

    drawCharacter(x, y, direction) {
        const sprite = Character.sprites[direction];
        this.ctx.drawImage(sprite, (x - 0.5) * this.tileSize, (y - 0.5) * this.tileSize, this.tileSize, this.tileSize);
    },

    drawWeapon(x, y, type, direction) {
        const weapon = Character.weaponSprites[type];
        let rotation = 0;

        switch (direction) {
            case 'up': rotation = -Math.PI / 2; break;
            case 'down': rotation = Math.PI / 2; break;
            case 'left': rotation = Math.PI; break;
            case 'right': rotation = 0; break;
        }

        this.ctx.save();
        this.ctx.translate(x * this.tileSize, y * this.tileSize);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(weapon, -this.tileSize / 2, -this.tileSize / 2, this.tileSize, this.tileSize);
        this.ctx.restore();
    },

    drawTitle() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.fillText('見下ろし方ローグライクRPG[開発中]', 0, 200);

        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(350, 300, 150, 50);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('PCで始める', 360, 335);
        this.ctx.fillText('スマホの場合は左下のスティックを傾けて、右上のボタンを押します', 20, 405);
        this.ctx.fillText('開発に協力したい方はお問い合わせください。JavaScript製です', 0, 580);
    },//2024 https://abellate.net/ All rights reserved.

    drawStatusBars(player) {
        const barWidth = 200;
        const barHeight = 20;
        const startX = 10;
        const startY = 10;

        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(startX, startY, barWidth * (player.hp / player.maxHp), barHeight);
        this.ctx.strokeStyle = 'white';
        this.ctx.strokeRect(startX, startY, barWidth, barHeight);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, startX + 5, startY + 15);

        this.ctx.fillStyle = 'orange';
        this.ctx.fillRect(startX, startY + 30, barWidth * (player.attack / 100), barHeight);
        this.ctx.strokeStyle = 'white';
        this.ctx.strokeRect(startX, startY + 30, barWidth, barHeight);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`攻撃力: ${player.attack}`, startX + 5, startY + 45);
    },

    drawFloorNumber(floor) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`${floor}階`, this.ctx.canvas.width - 70, 30);
    }
};