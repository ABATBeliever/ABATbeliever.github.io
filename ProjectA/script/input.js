const Input = {
    keys: {},
    joystick: {

        angle: 0,
        distance: 0
    },
    mobileControls: {
        sword: false,
        bow: false
    },

    init() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);

        this.setupJoystick();
        this.setupMouseEvents();
        this.setupMobileControls();
    },

    setupMouseEvents() {
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('click', e => this.handleClick(e));
        canvas.addEventListener('touchstart', e => this.handleTouch(e));
    },

    setupMobileControls() {
        const mobileControls = document.getElementById('mobileControls');
        const swordButton = document.getElementById('swordButton');
        const bowButton = document.getElementById('bowButton');

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            mobileControls.style.display = 'block';

            swordButton.addEventListener('touchstart', () => this.mobileControls.sword = true);
            swordButton.addEventListener('touchend', () => this.mobileControls.sword = false);

            bowButton.addEventListener('touchstart', () => this.mobileControls.bow = true);
            bowButton.addEventListener('touchend', () => this.mobileControls.bow = false);
        }
    },

    handleClick(e) {
        this.checkStartButton(e.clientX, e.clientY);
    },

    handleTouch(e) {
        e.preventDefault(); // デフォルトのタッチ動作を防止
        const touch = e.touches[0];
        this.checkStartButton(touch.clientX, touch.clientY);
    },

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    },

    setupJoystick() {
        const joystick = document.getElementById('joystick');
        const stick = document.getElementById('stick');

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            joystick.style.display = 'block';

            joystick.addEventListener('touchstart', e => this.handleJoystickStart(e));
            joystick.addEventListener('touchmove', e => this.handleJoystickMove(e));
            joystick.addEventListener('touchend', e => this.handleJoystickEnd(e));
        }
    },

    handleJoystickStart(e) {
        e.preventDefault();
        this.joystick.active = true;
    },

    handleJoystickMove(e) {
        if (!this.joystick.active) return;

        const touch = e.touches[0];
        const joystick = document.getElementById('joystick');
        const stick = document.getElementById('stick');

        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = touch.clientX - centerX;
        const deltaY = touch.clientY - centerY;

        this.joystick.angle = Math.atan2(deltaY, deltaX);
        this.joystick.distance = Math.min(50, Math.sqrt(deltaX * deltaX + deltaY * deltaY));

        const stickX = Math.cos(this.joystick.angle) * this.joystick.distance;
        const stickY = Math.sin(this.joystick.angle) * this.joystick.distance;

        stick.style.transform = `translate(${stickX}px, ${stickY}px)`;

        if (Game.currentScreen === 'title' && this.joystick.distance > 10) {
            Game.startGame();
        }
    },

    handleJoystickEnd(e) {
        this.joystick.active = false;
        this.joystick.angle = 0;
        this.joystick.distance = 0;
        document.getElementById('stick').style.transform = 'translate(0px, 0px)';
    },

    getMovementVector() {
        let dx = 0;
        let dy = 0;

        if (this.joystick.active) {
            dx = Math.cos(this.joystick.angle) * (this.joystick.distance / 50);
            dy = Math.sin(this.joystick.angle) * (this.joystick.distance / 50);
        } else {
            if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA')) dx -= 1;
            if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD')) dx += 1;
            if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW')) dy -= 1;
            if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS')) dy += 1;
        }

        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 0) {
            dx /= length;
            dy /= length;
        }

        return { dx, dy };
    },

    checkStartButton(clientX, clientY) {
        const canvas = document.getElementById('gameCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (Game.currentScreen === 'title') {
            if (x >= 350 && x <= 450 && y >= 300 && y <= 350) {
                Game.startGame();
            }
        }
    },

    isSwordPressed() {
        return this.isKeyPressed('KeyZ') || this.mobileControls.sword;
    },

    isBowPressed() {
        return this.isKeyPressed('KeyX') || this.mobileControls.bow;
    }
};