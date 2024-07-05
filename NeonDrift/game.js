const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const menu = document.getElementById('menu');
const customizeButton = document.getElementById('customizeButton');
const leaderboardButton = document.getElementById('leaderboardButton');

let gameLoop;
let player = { x: 0, width: 60, height: 100, speed: 5, color: '#0ff', boostTime: 0, shieldTime: 0 };
let road = { width: 600, stripeWidth: 20, stripeGap: 40 };
let obstacles = [];
let powerUps = [];
let keys = { left: false, right: false };
let courseAngle = 0;
let targetCourseAngle = 0;
let turnTimer = 0;
let score = 0;
let level = 1;
let gameTime = 0;
let backgroundParticles = [];
let sounds = {};
let gameMode = 'classic';
let achievements = JSON.parse(localStorage.getItem('achievements')) || [];
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

let scale = 1;

function resizeCanvas() {
    const maxWidth = 1200; // 最大幅を設定
    const maxHeight = 800; // 最大高さを設定
    
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = maxWidth / maxHeight;

    if (windowRatio < gameRatio) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / gameRatio;
    } else {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * gameRatio;
    }

    scale = canvas.width / maxWidth;

    // ゲーム要素のスケーリング
    player.width = 60 * scale;
    player.height = 100 * scale;
    player.speed = 5 * scale;
    road.width = 600 * scale;
}

function drawRoad() {
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const perspectiveStart = canvas.height * 0.5;

    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(centerX - road.width / 2, canvas.height);
    
    const controlPoint1X = centerX - road.width / 4 + courseAngle * 300;
    const controlPoint1Y = canvas.height * 0.75;
    const controlPoint2X = centerX - road.width / 4 + courseAngle * 600;
    const controlPoint2Y = perspectiveStart;
    
    ctx.bezierCurveTo(
        controlPoint1X, controlPoint1Y,
        controlPoint2X, controlPoint2Y,
        centerX + courseAngle * 600, perspectiveStart
    );
    
    ctx.lineTo(centerX + road.width / 4 + courseAngle * 600, perspectiveStart);
    ctx.bezierCurveTo(
        centerX + road.width / 4 + courseAngle * 600, perspectiveStart,
        centerX + road.width / 4 + courseAngle * 300, controlPoint1Y,
        centerX + road.width / 2, canvas.height
    );
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(centerX - road.width / 2, canvas.height);
    ctx.bezierCurveTo(
        controlPoint1X, controlPoint1Y,
        controlPoint2X, controlPoint2Y,
        centerX + courseAngle * 600, perspectiveStart
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + road.width / 2, canvas.height);
    ctx.bezierCurveTo(
        centerX + road.width / 4 + courseAngle * 300, controlPoint1Y,
        centerX + road.width / 4 + courseAngle * 600, perspectiveStart,
        centerX + road.width / 4 + courseAngle * 600, perspectiveStart
    );
    ctx.stroke();
}

function drawPlayer() {
    const centerX = canvas.width / 2 + player.x * scale;
    const bottomY = canvas.height - 50 * scale;

    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(centerX, bottomY - player.height);
    ctx.lineTo(centerX - player.width / 2, bottomY);
    ctx.lineTo(centerX + player.width / 2, bottomY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    if (player.boostTime > 0) {
        drawNitroEffect(centerX, bottomY);
    }
}

function drawNitroEffect(x, y) {
    ctx.fillStyle = '#ff0';
    for (let i = 0; i < 10; i++) {
        const particleX = x + (Math.random() - 0.5) * player.width;
        const particleY = y + Math.random() * 20;
        const size = Math.random() * 5 + 2;
        ctx.beginPath();
        ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const perspectiveFactor = obstacle.z / 1000;
        const width = obstacle.width * perspectiveFactor;
        const height = obstacle.height * perspectiveFactor;
        const x = canvas.width / 2 + (obstacle.x + courseAngle * obstacle.z / 5) * perspectiveFactor - width / 2;
        const y = canvas.height * 0.6 + (obstacle.z / 1000) * (canvas.height * 0.4) - height;

        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        if (obstacle.type === 'spinning') {
            ctx.rotate(obstacle.angle);
        }
        ctx.fillStyle = obstacle.type === 'moving' ? '#f0f' : (obstacle.type === 'spinning' ? '#ff0' : '#f00');
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        ctx.restore();
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        const perspectiveFactor = powerUp.z / 1000;
        const size = 30 * perspectiveFactor;
        const x = canvas.width / 2 + (powerUp.x + courseAngle * powerUp.z / 5) * perspectiveFactor - size / 2;
        const y = canvas.height * 0.6 + (powerUp.z / 1000) * (canvas.height * 0.4) - size;
        
        ctx.fillStyle = powerUp.type === 'speed' ? '#0f0' : (powerUp.type === 'shield' ? '#00f' : '#ff0');
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function movePlayer() {
    if (keys.left) player.x -= player.speed / scale;
    if (keys.right) player.x += player.speed / scale;
    player.x = Math.max(-road.width / 2 / scale, Math.min(road.width / 2 / scale, player.x));
}

function createObstacle() {
    const types = ['regular', 'moving', 'spinning'];
    const type = types[Math.floor(Math.random() * types.length)];
    obstacles.push({
        x: (Math.random() - 0.5) * road.width / scale,
        z: 100,
        width: 60 * scale,
        height: 60 * scale,
        speed: (5 + Math.random() * 5 + level) * scale,
        type: type,
        angle: 0,
        moveDirection: Math.random() < 0.5 ? -1 : 1,
    });
}

function createPowerUp() {
    const types = ['speed', 'shield', 'points'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push({
        x: (Math.random() - 0.5) * road.width,
        z: 100,
        speed: 5 + Math.random() * 5,
        type: type
    });
}

function updateObstacles() {
    obstacles = obstacles.filter(obstacle => {
        obstacle.z += obstacle.speed;
        if (obstacle.type === 'moving') {
            obstacle.x += obstacle.moveDirection * 2;
            if (Math.abs(obstacle.x) > road.width / 2) {
                obstacle.moveDirection *= -1;
            }
        } else if (obstacle.type === 'spinning') {
            obstacle.angle += 0.1;
        }
        return obstacle.z < 1000;
    });
}

function updatePowerUps() {
    powerUps = powerUps.filter(powerUp => {
        powerUp.z += powerUp.speed;
        return powerUp.z < 1000;
    });
}

function checkCollision() {
    if (player.shieldTime > 0) return false;
    return obstacles.some(obstacle => {
        const perspectiveFactor = obstacle.z / 1000;
        const width = obstacle.width * perspectiveFactor;
        const x = canvas.width / 2 + (obstacle.x + courseAngle * obstacle.z / 5) * perspectiveFactor - width / 2;
        const y = canvas.height * 0.6 + (obstacle.z / 1000) * (canvas.height * 0.4);
        return Math.abs(x - (canvas.width / 2 + player.x)) < player.width / 2 && 
               y > canvas.height - 150 && 
               y < canvas.height - 50;
    });
}

function checkPowerUpCollision() {
    powerUps = powerUps.filter(powerUp => {
        const perspectiveFactor = powerUp.z / 1000;
        const size = 30 * perspectiveFactor;
        const x = canvas.width / 2 + (powerUp.x + courseAngle * powerUp.z / 5) * perspectiveFactor - size / 2;
        const y = canvas.height * 0.6 + (powerUp.z / 1000) * (canvas.height * 0.4);
        if (Math.abs(x - (canvas.width / 2 + player.x)) < player.width / 2 && 
            y > canvas.height - 150 && 
            y < canvas.height - 50) {
            activatePowerUp(powerUp.type);
            return false;
        }
        return true;
    });
}

function activatePowerUp(type) {
    switch (type) {
        case 'speed':
            player.boostTime = 1000;
            player.speed = 10;
            setTimeout(() => {
                player.speed = 5;
                player.boostTime = 0;
            }, 5000);
            break;
        case 'shield':
            player.shieldTime = 1000;
            setTimeout(() => {
                player.shieldTime = 0;
            }, 5000);
            break;
        case 'points':
            score += 2000;
            break;
    }
    playSoundEffect('powerup');
}

function updateCourseAngle() {
    turnTimer--;
    if (turnTimer <= 0) {
        targetCourseAngle = (Math.random() - 0.5) * 0.1;
        turnTimer = Math.floor(Math.random() * 10) + 1;
    }
    
    const angleChange = (targetCourseAngle - courseAngle) * 0.05;
    courseAngle += angleChange;
}

function updateBackgroundParticles() {
    backgroundParticles.forEach(particle => {
        particle.x += particle.speed * Math.cos(particle.angle);
        particle.y += particle.speed * Math.sin(particle.angle);
        particle.z -= particle.speed;

        if (particle.z < 0) {
            particle.z = 1000;
            particle.x = (Math.random() - 0.5) * canvas.width;
            particle.y = (Math.random() - 0.5) * canvas.height;
        }
    });
}

function drawBackgroundParticles() {
    ctx.fillStyle = '#fff';
    backgroundParticles.forEach(particle => {
        const perspectiveFactor = particle.z / 1000;
        const size = 2 * (1 - perspectiveFactor);
        const x = canvas.width / 2 + particle.x * perspectiveFactor;
        const y = canvas.height / 2 + particle.y * perspectiveFactor;
        ctx.fillRect(x, y, size, size);
    });
}

function gameOver() {
    cancelAnimationFrame(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 60);
    ctx.fillText(`スコア: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText(`レベル: ${level}`, canvas.width / 2, canvas.height / 2 + 20);
    menu.style.display = 'block';
    playSoundEffect('gameover');
    updateLeaderboard();
    checkAchievements();
}

function updateScore() {
    score += 1 + level;
    if (score > level * 1000) {
        level++;
        playSoundEffect('levelup');
    }
}

function drawHUD() {
    ctx.fillStyle = '#fff';
    ctx.font = `${20 * scale}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(`スコア: ${score}`, 20 * scale, 30 * scale);
    ctx.fillText(`レベル: ${level}`, 20 * scale, 60 * scale);
    
    if (player.shieldTime > 0) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function update() {
    gameTime++;
    drawRoad();
    drawBackgroundParticles();
    drawPlayer();
    drawObstacles();
    drawPowerUps();
    drawHUD();
    movePlayer();
    updateObstacles();
    updatePowerUps();
    updateCourseAngle();
    updateBackgroundParticles();
    updateScore();

    if (gameMode === 'classic') {
        if (gameTime % Math.max(1, 60 - level * 5) === 0) {
            createObstacle();
        }
    } else if (gameMode === 'endless') {
        if (gameTime % Math.max(1, 30 - level * 2) === 0) {
            createObstacle();
        }
    }

    if (gameTime % 300 === 0) {
        createPowerUp();
    }

    checkPowerUpCollision();

    if (checkCollision()) {
        gameOver();
        return;
    }

    gameLoop = requestAnimationFrame(update);
}

function startGame(mode) {
    gameMode = mode;
    menu.style.display = 'none';
    player.x = 0;
    player.speed = 5;
    player.boostTime = 0;
    player.shieldTime = 0;
    obstacles = [];
    powerUps = [];
    courseAngle = 0;
    targetCourseAngle = 0;
    turnTimer = 0;
    score = 0;
    level = 1;
    gameTime = 0;
    initBackgroundParticles();
    playSoundEffect('start');
    playBGM();
    update();
}

function initBackgroundParticles() {
    backgroundParticles = [];
    for (let i = 0; i < 100; i++) {
        backgroundParticles.push({
            x: (Math.random() - 0.5) * canvas.width,
            y: (Math.random() - 0.5) * canvas.height,
            z: Math.random() * 1000,
            speed: 1 + Math.random() * 2,
            angle: Math.random() * Math.PI * 2
        });
    }
}

function loadSounds() {
    const soundEffects = ['start', 'powerup', 'levelup', 'gameover'];
    soundEffects.forEach(effect => {
        const audio = new Audio(`./sounds/${effect}.mp3`);
        sounds[effect] = audio;
    });
    sounds.bgm = new Audio('./sounds/bgm.mp3');
    sounds.bgm.loop = true;
}

function playSoundEffect(effect) {
    if (sounds[effect]) {
        sounds[effect].currentTime = 0;
        sounds[effect].play();
    }
}

function playBGM() {
    if (sounds.bgm) {
        sounds.bgm.play();
    }
}

window.addEventListener('load', () => {
    resizeCanvas();
    loadSounds();
    initBackgroundParticles();
});
window.addEventListener('resize', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    if (touchX < canvas.width / 2) {
        keys.left = true;
    } else {
        keys.right = true;
    }
});
canvas.addEventListener('touchend', () => {
    keys.left = false;
    keys.right = false;
});

startButton.addEventListener('click', () => startGame('classic'));
document.getElementById('endlessButton').addEventListener('click', () => startGame('endless'));
customizeButton.addEventListener('click', showCustomizeMenu);
leaderboardButton.addEventListener('click', showLeaderboard);

resizeCanvas();
loadSounds();
initBackgroundParticles();