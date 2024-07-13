class Player {
    constructor(level) {
        this.level = level;
        this.position = this.findStartPosition();
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.speed = 0.1;
        this.radius = 0.2;
        this.weapon = new Weapon();
    }

    findStartPosition() {
        return new THREE.Vector3(0, 1, 0);
    }

    move(direction) {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(this.rotation);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3(1, 0, 0);
        right.applyEuler(this.rotation);
        right.normalize();

        const newPosition = this.position.clone();

        if (direction === 'forward') newPosition.add(forward.multiplyScalar(this.speed));
        if (direction === 'backward') newPosition.sub(forward.multiplyScalar(this.speed));
        if (direction === 'left') newPosition.sub(right.multiplyScalar(this.speed));
        if (direction === 'right') newPosition.add(right.multiplyScalar(this.speed));

        if (!this.checkCollision(newPosition)) {
            this.position.copy(newPosition);
        }
    }

    checkCollision(position) {
        const mazeX = Math.floor(position.x + this.level.size/2);
        const mazeZ = Math.floor(position.z + this.level.size/2);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const checkX = mazeX + i;
                const checkZ = mazeZ + j;
                if (checkX >= 0 && checkX < this.level.size && checkZ >= 0 && checkZ < this.level.size) {
                    if (this.level.map[checkX][checkZ] === 1) {
                        const obstacleCenter = new THREE.Vector3(checkX - this.level.size/2 + 0.5, 1, checkZ - this.level.size/2 + 0.5);
                        const distance = position.distanceTo(obstacleCenter);
                        if (distance < this.radius + 0.5) {
                            return true; // 衝突あり
                        }
                    }
                }
            }
        }
        return false; // 衝突なし
    }

    rotate(x, y) {
        this.rotation.y -= x * 0.002;
        this.rotation.x -= y * 0.002;
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    }

    shoot() {
        this.weapon.fire(this.position, this.rotation);
    }
}

class Weapon {
    constructor() {
        this.damage = 10;
        this.cooldown = 200; // ミリ秒
        this.lastShot = 0;
        this.bullets = [];
    }

    fire(position, rotation) {
        const now = Date.now();
        if (now - this.lastShot < this.cooldown) return;

        this.lastShot = now;
        const bullet = new Bullet(position, rotation);
        this.bullets.push(bullet);
        scene.add(bullet.mesh);
    }
}

class Bullet {
    constructor(position, rotation) {
        this.position = position.clone();
        this.direction = new THREE.Vector3(0, 0, -1).applyEuler(rotation);
        this.speed = 0.5;
        this.lifespan = 2000; // ミリ秒
        this.createdAt = Date.now();
        this.shouldRemove = false;

        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
    }

    update() {
        this.position.add(this.direction.multiplyScalar(this.speed));
        this.mesh.position.copy(this.position);

        if (Date.now() - this.createdAt > this.lifespan) {
            this.shouldRemove = true;
        }
    }
}