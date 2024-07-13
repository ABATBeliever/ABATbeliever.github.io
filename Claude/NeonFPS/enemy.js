class Enemy {
    constructor(level) {
        this.level = level;
        this.position = this.getRandomPosition();
        this.speed = 0.03;
        this.health = 100;

        const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
    }

    getRandomPosition() {
        let x, z;
        do {
            x = Math.floor(Math.random() * this.level.size);
            z = Math.floor(Math.random() * this.level.size);
        } while (this.level.map[x][z] === 1);

        return new THREE.Vector3(x - this.level.size/2 + 0.5, 0.5, z - this.level.size/2 + 0.5);
    }

    update(player) {
        const direction = new THREE.Vector3()
            .subVectors(player.position, this.position)
            .normalize();
        
        const newPosition = this.position.clone().add(direction.multiplyScalar(this.speed));
        
        if (!this.checkCollision(newPosition)) {
            this.position.copy(newPosition);
            this.mesh.position.copy(this.position);
        }
    }

    checkCollision(position) {
        const levelX = Math.floor(position.x + this.level.size/2);
        const levelZ = Math.floor(position.z + this.level.size/2);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const checkX = levelX + i;
                const checkZ = levelZ + j;
                if (checkX >= 0 && checkX < this.level.size && checkZ >= 0 && checkZ < this.level.size) {
                    if (this.level.map[checkX][checkZ] === 1) {
                        const obstacleCenter = new THREE.Vector3(checkX - this.level.size/2 + 0.5, 0.5, checkZ - this.level.size/2 + 0.5);
                        const distance = position.distanceTo(obstacleCenter);
                        if (distance < 0.25 + 0.5) {
                            return true; // 衝突あり
                        }
                    }
                }
            }
        }
        return false; // 衝突なし
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        scene.remove(this.mesh);
        const index = enemies.indexOf(this);
        if (index > -1) {
            enemies.splice(index, 1);
        }
    }
}