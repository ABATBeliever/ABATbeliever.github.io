class Level {
    constructor(size) {
        this.size = size;
        this.map = [];
        this.generateRandomObstacles();
    }

    generateRandomObstacles() {
        for (let i = 0; i < this.size; i++) {
            this.map[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.map[i][j] = Math.random() < 0.2 ? 1 : 0; // 20%の確率で障害物を配置
            }
        }
        this.ensureClearPath();
    }

    ensureClearPath() {
        // プレイヤーの周囲を空けるように修正
        const clearArea = 5;
        for (let i = 0; i < clearArea; i++) {
            for (let j = 0; j < clearArea; j++) {
                this.map[i][j] = 0;
            }
        }
    }

    getObstacleGeometry() {
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        });
        const obstacleGroup = new THREE.Group();

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.map[i][j] === 1) {
                    const obstacle = new THREE.Mesh(geometry, material);
                    obstacle.position.set(i - this.size/2, 1, j - this.size/2);
                    obstacleGroup.add(obstacle);
                }
            }
        }

        return obstacleGroup;
    }
}