class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = new Fighter(100, 400, 'player');
        this.enemy = new Fighter(600, 400, 'enemy');
        
        this.keys = {};
        this.keyDisplay = document.getElementById('key-display');
        
        this.ground = 500;        
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameover'
        
        this.sounds = {
            attack: new Audio('./sounds/attack.mp3'),
            jump: new Audio('./sounds/jump.mp3'),
            damage: new Audio('./sounds/damage.mp3'),
            bgm: new Audio('./sounds/bgm.mp3'),
            energyBall: new Audio('./sounds/attack.mp3') // エネルギー玉の効果音（既存の攻撃音を流用）
        };
        this.sounds.bgm.loop = true;

        this.projectiles = [];

        this.init();
    }
    
    init() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.updateKeyDisplay();
            if (e.code === 'Enter') this.handleEnterKey();
            if (e.code === 'Escape') this.togglePause();
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.updateKeyDisplay();
        });
        this.gameLoop();
    }
    
    handleEnterKey() {
        if (this.gameState === 'start') {
            this.startGame();
        } else if (this.gameState === 'gameover') {
            this.resetGame();
        }
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.sounds.bgm.pause();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.sounds.bgm.play();
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.sounds.bgm.play();
    }

    resetGame() {
        this.player = new Fighter(100, 400, 'player');
        this.enemy = new Fighter(600, 400, 'enemy');
        this.projectiles = [];
        this.gameState = 'playing';
        this.sounds.bgm.currentTime = 0;
        this.sounds.bgm.play();
    }
    
    updateKeyDisplay() {
        this.keyDisplay.textContent = Object.keys(this.keys).filter(key => this.keys[key]).join(', ');
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.gameState === 'playing') {
            this.player.update(this.keys, this.ground, this.canvas.width);
            this.updateAI();
            this.updateProjectiles();
            this.checkCollision();
            this.updateHealthBars();
        }
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(p => p.isActive());
        this.projectiles.forEach(p => p.update());
    }

    updateAI() {
        const ai = this.enemy;
        const player = this.player;

        // AIの向きを更新
        ai.updateDirection(player.x);

        // 簡単なAIロジック
        if (Math.abs(ai.x - player.x) > 100 && Math.random() < 0.4) {
            // プレイヤーに近づく
            if (ai.x < player.x) {
                ai.moveRight();
            } else {
                ai.moveLeft();
            }
        } else {
            // 攻撃範囲内なら攻撃
            if (Math.random() < 0.02 && !ai.isCrouching) { // 5%の確率で攻撃
                ai.attack();
            }
        }

        // ランダムにジャンプ
        if (Math.random() < 0.04 && !ai.isJumping) { // 1%の確率でジャンプ
            ai.jump();
        }

        // エネルギー玉を発射する
        if (Math.random() < 0.02 && !ai.isCrouching) { // 2%の確率でエネルギー玉を発射
            this.fireEnergyBall(ai);
        }

        ai.update({}, this.ground, this.canvas.width);
    }

    fireEnergyBall(fighter) {
        if (!fighter.isCrouching && fighter.energyBallCooldown === 0) {
            const energyBall = new EnergyBall(
                fighter.x + fighter.width / 2,
                fighter.y + fighter.height / 2,
                fighter.direction,
                fighter.type
            );
            this.projectiles.push(energyBall);
            fighter.energyBallCooldown = 60; // 1秒のクールダウン
            this.sounds.energyBall.play();
        }
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 地面の描画
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, this.ground, this.canvas.width, this.canvas.height - this.ground);
        
        if (this.gameState === 'start') {
            this.renderStartScreen();
        } else if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.player.render(this.ctx);
            this.enemy.render(this.ctx);
            this.projectiles.forEach(p => p.render(this.ctx));
            if (this.gameState === 'paused') {
                this.renderPauseScreen();
            }
        } else if (this.gameState === 'gameover') {
            this.renderGameOverScreen();
        }
    }

    renderStartScreen() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.fillText('NeonFighter', this.canvas.width / 2 - 120, this.canvas.height / 2);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press Enter to Start', this.canvas.width / 2 - 100, this.canvas.height / 2 + 50);
    }

    renderPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.fillText('Paused', this.canvas.width / 2 - 70, this.canvas.height / 2);
    }

    renderGameOverScreen() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.fillText('Game Over', this.canvas.width / 2 - 100, this.canvas.height / 2);
        this.ctx.font = '24px Arial';
        game.sounds.bgm.pause();
        this.ctx.fillText('Press Enter to Restart', this.canvas.width / 2 - 100, this.canvas.height / 2 + 50);
    }
    
    checkCollision() {
        if (this.player.isAttacking && this.player.attackBox.isColliding(this.enemy) && !this.enemy.isInvulnerable && !this.enemy.isCrouching) {
            console.log('Player hit enemy!');
            this.enemy.takeDamage(10);
            this.player.isAttacking = false;
            this.enemy.setInvulnerable();
            this.sounds.damage.play();
            if (this.enemy.health <= 0) {
                this.gameState = 'gameover';
                console.log('Player wins!');
            }
        }

        if (this.enemy.isAttacking && this.enemy.attackBox.isColliding(this.player) && !this.player.isInvulnerable && !this.player.isCrouching) {
            console.log('Enemy hit player!');
            this.player.takeDamage(10);
            this.enemy.isAttacking = false;
            this.player.setInvulnerable();
            this.sounds.damage.play();
            if (this.player.health <= 0) {
                this.gameState = 'gameover';
                console.log('Enemy wins!');
            }
        }

        this.projectiles.forEach(projectile => {
            const target = projectile.owner === 'player' ? this.enemy : this.player;
            if (projectile.isColliding(target) && !target.isInvulnerable) {
                console.log(`${projectile.owner} hit ${target.type} with energy ball!`);
                target.takeDamage(5);
                target.setInvulnerable();
                this.sounds.damage.play();
                projectile.deactivate();

                if (target.health <= 0) {
                    this.gameState = 'gameover';
                    console.log(`${projectile.owner} wins!`);
                }
            }
        });
    }
    
    updateHealthBars() {
        document.getElementById('player-health-bar').style.width = `${this.player.health}%`;
        document.getElementById('enemy-health-bar').style.width = `${this.enemy.health}%`;
    }
}

class Fighter {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 100;
        this.type = type;
        this.health = 100;
        this.speed = 5;
        this.jumpForce = 15;
        this.gravity = 0.8;
        this.velocityY = 0;
        this.isJumping = false;
        this.isCrouching = false;
        this.isAttacking = false;
        this.isInvulnerable = false;
        this.attackBox = new AttackBox(this);
        this.attackCooldown = 0;
        this.energyBallCooldown = 0;
        this.direction = type === 'player' ? 1 : -1;
    }
    
    update(keys, ground, canvasWidth) {
        if (this.type === 'player') {
            if (keys['ArrowLeft'] || keys['KeyA']) this.moveLeft();
            if (keys['ArrowRight'] || keys['KeyD']) this.moveRight();
            if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && !this.isJumping) {
                this.jump();
                game.sounds.jump.play();
            }
            if (keys['ArrowDown'] || keys['KeyS'] || keys['KeyX']) {
                this.crouch();
            } else {
                this.stand();
            }
            if (keys['KeyZ'] && this.attackCooldown === 0 && !this.isCrouching) {
                this.attack();
                game.sounds.attack.play();
            }
            if (keys['KeyC'] && this.energyBallCooldown === 0 && !this.isCrouching) {
                game.fireEnergyBall(this);
            }
            if (keys['ArrowLeft'] || keys['KeyA']) this.direction = -1;
            if (keys['ArrowRight'] || keys['KeyD']) this.direction = 1;
        }
        
        this.applyGravity(ground);
        this.stayInBounds(canvasWidth);
        this.updateAttackBox();
        
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        if (this.energyBallCooldown > 0) {
            this.energyBallCooldown--;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.type === 'player' ? '#0f0' : '#f00';
        if (this.isInvulnerable) {
            ctx.globalAlpha = 0.5;
        }
        ctx.fillRect(this.x, this.y, this.width, this.isCrouching ? this.height / 2 : this.height);
        ctx.globalAlpha = 1;
        
        if (this.isAttacking) {
            this.attackBox.render(ctx);
        }
    }
    
    moveLeft() {
        this.x -= this.speed;
    }
    
    moveRight() {
        this.x += this.speed;
    }
    
    jump() {
        this.velocityY = -this.jumpForce;
        this.isJumping = true;
    }
    
    crouch() {
        if (!this.isCrouching) {
            this.isCrouching = true;
            this.y += this.height / 2;
        }
    }
    
    stand() {
        if (this.isCrouching) {
            this.isCrouching = false;
            this.y -= this.height / 2;
        }
    }
    
    attack() {
        if (!this.isAttacking && !this.isCrouching) {
            this.isAttacking = true;
            this.attackCooldown = 20;
            setTimeout(() => {
                this.isAttacking = false;
            }, 20); // 攻撃の持続時間
        }
    }

    updateDirection(targetX) {
        this.direction = targetX > this.x ? 1 : -1;
    }
    
    applyGravity(ground) {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        const effectiveHeight = this.isCrouching ? this.height / 2 : this.height;
        if (this.y + effectiveHeight > ground) {
            this.y = ground - effectiveHeight;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }
    
    stayInBounds(canvasWidth) {
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
    }
    
    updateAttackBox() {
        this.attackBox.update(this.x, this.y, this.width, this.height, this.isCrouching, this.direction);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }
    
    setInvulnerable() {
        this.isInvulnerable = true;
        setTimeout(() => {
            this.isInvulnerable = false;
        }, 1000); // 1秒間の無敵時間
    }
}

class AttackBox {
    constructor(fighter) {
        this.fighter = fighter;
        this.width = 60;
        this.height = 20;
    }
    
    update(fighterX, fighterY, fighterWidth, fighterHeight, isCrouching, direction) {
        this.x = direction > 0 ? fighterX + fighterWidth : fighterX - this.width;
        this.y = fighterY + (isCrouching ? fighterHeight / 4 : fighterHeight / 2) - this.height / 2;
    }
    
    render(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    isColliding(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}

class EnergyBall {
    constructor(x, y, direction, owner) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.speed = 8;
        this.direction = direction;
        this.owner = owner;
        this.active = true;
    }

    update() {
        this.x += this.speed * this.direction;
    }

    render(ctx) {
        ctx.fillStyle = this.owner === 'player' ? '#00ffff' : '#ff00ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    isActive() {
        return this.active && this.x > 0 && this.x < game.canvas.width;
    }

    deactivate() {
        this.active = false;
    }

    isColliding(fighter) {
        return (
            this.x - this.radius < fighter.x + fighter.width &&
            this.x + this.radius > fighter.x &&
            this.y - this.radius < fighter.y + fighter.height &&
            this.y + this.radius > fighter.y
        );
    }
}

const game = new Game();