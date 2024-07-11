const Character = {
    arrows: [],

    init() {
        this.player = {
            x: 1,
            y: 1,
            direction: 'down',
            hp: 100,
            maxHp: 100,
            mp: 50,
            attack: 10,
            defense: 5,
            moveSpeed: 0.05,
            sword: {
                active: false,
                duration: 0,
                maxDuration: 0.125 // 0.125秒
            },
            arrow: {
                lastShot: 0,
                cooldown: 500, // 0.5秒
                speed: 0.2 // 1フレームあたりの移動距離
            }
        };
        this.loadSprites();
        this.loadWeaponSprites();
    },

    loadSprites() {
        this.sprites = {
            left: new Image(),
            right: new Image(),
            up: new Image(),
            down: new Image()
        };
        this.sprites.left.src = './pic/chara_2.jpg';
        this.sprites.right.src = './pic/chara_3.jpg';
        this.sprites.up.src = './pic/chara_4.jpg';
        this.sprites.down.src = './pic/chara_1.jpg';
    },

    loadWeaponSprites() {
        this.weaponSprites = {
            sword: new Image(),
            arrow: new Image()
        };
        this.weaponSprites.sword.src = './pic/sword.png';
        this.weaponSprites.arrow.src = './pic/arrow.png';
    },

    update(deltaTime) {
        const { dx, dy } = Input.getMovementVector();
        this.movePlayer(dx, dy);

        if (this.player.sword.active) {
            this.player.sword.duration += deltaTime;
            let hitEnemy = false;

            Dungeon.enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 1) {
                    const damage = Math.floor(Math.random() * 2) + 3; // 3~4のダメージ
                    enemy.hp -= damage;
                    console.log(`Sword hit ${enemy.name}! Damage: ${damage}, Remaining HP: ${enemy.hp}`);
                    Sound.playSFX('attack');
                    hitEnemy = true;
                }
            });

            if (hitEnemy) {
                this.player.sword.active = false;
                this.player.sword.duration = 0;
                console.log('Sword deactivated due to enemy hit');
            } else if (this.player.sword.duration >= this.player.sword.maxDuration) {
                this.player.sword.active = false;
                this.player.sword.duration = 0;
                console.log('Sword deactivated due to time limit');
            }
        }

        if (Input.isSwordPressed() && !this.player.sword.active) {
            this.player.sword.active = true;
            this.player.sword.duration = 0;
            console.log('Sword activated');
        }

        if (Input.isBowPressed()) {
            const currentTime = performance.now();
            if (currentTime - this.player.arrow.lastShot >= this.player.arrow.cooldown) {
                this.shootArrow();
                this.player.arrow.lastShot = currentTime;
            }
        }

        // 矢の更新
        this.updateArrows(deltaTime);
    },

    movePlayer(dx, dy) {
        if (dx !== 0 || dy !== 0) {
            const newX = this.player.x + dx * this.player.moveSpeed;
            const newY = this.player.y + dy * this.player.moveSpeed;

            if (Dungeon.isWalkable(newX, newY)) {
                this.player.x = newX;
                this.player.y = newY;
            }

            if (Math.abs(dx) > Math.abs(dy)) {
                this.player.direction = dx > 0 ? 'right' : 'left';
            } else {
                this.player.direction = dy > 0 ? 'down' : 'up';
            }
        }
    },

    shootArrow() {
        const arrowSpeed = this.player.arrow.speed;
        let dx = 0, dy = 0;

        switch (this.player.direction) {
            case 'up': dy = -arrowSpeed; break;
            case 'down': dy = arrowSpeed; break;
            case 'left': dx = -arrowSpeed; break;
            case 'right': dx = arrowSpeed; break;
        }

        this.arrows.push({
            x: this.player.x,
            y: this.player.y,
            dx: dx,
            dy: dy
        });
    },

    updateArrows(deltaTime) {
        this.arrows = this.arrows.filter(arrow => {
            arrow.x += arrow.dx;
            arrow.y += arrow.dy;

            // 壁との衝突チェック
            if (Dungeon.isWall(Math.floor(arrow.x), Math.floor(arrow.y))) {
                return false; // 矢を削除
            }

            // 敵との衝突チェック
            let hitEnemy = false;
            Dungeon.enemies.forEach(enemy => {
                const dx = enemy.x - arrow.x;
                const dy = enemy.y - arrow.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 0.5) {
                    const damage = Math.floor(Math.random() * 2) + 2; // 2~3のダメージ
                    enemy.hp -= damage;
                    console.log(`Arrow hit ${enemy.name}! Damage: ${damage}, Remaining HP: ${enemy.hp}`);
                    Sound.playSFX('attack');
                    hitEnemy = true;
                }
            });

            return !hitEnemy; // 敵に当たった場合は矢を削除
        });
    },

    render() {
        Graphics.drawCharacter(this.player.x, this.player.y, this.player.direction);

        if (this.player.sword.active) {
            this.renderSword();
        }

        this.arrows.forEach(arrow => {
            Graphics.drawWeapon(arrow.x, arrow.y, 'arrow', this.getArrowDirection(arrow));
        });

        Graphics.ctx.fillStyle = 'white';
        Graphics.ctx.font = '12px Arial';
    },

    renderSword() {
        const swordOffset = 0.5;
        let swordX = this.player.x;
        let swordY = this.player.y;

        switch (this.player.direction) {
            case 'up': swordY -= swordOffset; break;
            case 'down': swordY += swordOffset; break;
            case 'left': swordX -= swordOffset; break;
            case 'right': swordX += swordOffset; break;
        }

        Graphics.drawWeapon(swordX, swordY, 'sword', this.player.direction);
    },

    getArrowDirection(arrow) {
        if (arrow.dx > 0) return 'right';
        if (arrow.dx < 0) return 'left';
        if (arrow.dy > 0) return 'down';
        if (arrow.dy < 0) return 'up';
        return 'right'; // デフォルト
    },

    isSwordActive() {
        return this.player.sword.active;
    }
};