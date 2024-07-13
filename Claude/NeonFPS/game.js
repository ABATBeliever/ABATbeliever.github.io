let scene, camera, renderer, level, player, enemies;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000033); // ネオンっぽい暗い青色の背景

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    level = new Level(100);
    scene.add(level.getObstacleGeometry());

    player = new Player(level);
    camera.position.copy(player.position);

    enemies = [];
    spawnEnemies(10); // 10体のエネミーを生成

    const floorGeometry = new THREE.PlaneGeometry(level.size, level.size);
    const floorTexture = new THREE.TextureLoader().load('neon_grid.png');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(level.size / 10, level.size / 10);
    const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture, emissive: 0x0000ff, emissiveIntensity: 0.2 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('click', lockPointer, false);
}

function lockPointer() {
    document.body.requestPointerLock();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    switch(event.keyCode) {
        case 87: // W
            player.move('forward');
            break;
        case 83: // S
            player.move('backward');
            break;
        case 65: // A
            player.move('left');
            break;
        case 68: // D
            player.move('right');
            break;
        case 32: // Space
            player.shoot();
            break;
    }
}

function onMouseMove(event) {
    if (document.pointerLockElement === document.body) {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        player.rotate(movementX, movementY);
    }
}

document.addEventListener('mousemove', onMouseMove, false);

function spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
        const enemy = new Enemy(level);
        enemies.push(enemy);
        scene.add(enemy.mesh);
    }
}

function animate() {
    requestAnimationFrame(animate);
    updateEnemies();
    updateBullets();
    camera.position.copy(player.position);
    camera.rotation.copy(player.rotation);
    renderer.render(scene, camera);
}

function updateEnemies() {
    enemies.forEach(enemy => enemy.update(player));
}

function updateBullets() {
    player.weapon.bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.shouldRemove) {
            scene.remove(bullet.mesh);
            player.weapon.bullets.splice(index, 1);
        }
    });
}

init();
animate();