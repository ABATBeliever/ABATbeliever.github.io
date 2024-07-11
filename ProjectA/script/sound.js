const Sound = {
    init() {
        this.bgm = {
            dungeon: new Audio('./se/stage.mp3'),
            battle: new Audio('./se/battle.mp3')
        };
        this.sfx = {
            attack: new Audio('./se/attack.mp3')
        };

        // BGMをループ再生するように設定
        this.bgm.dungeon.loop = true;
        this.bgm.battle.loop = true;
    },

    playBGM(type) {
        // 現在再生中のBGMを停止
        Object.values(this.bgm).forEach(audio => audio.pause());

        // 指定されたBGMを再生
        this.bgm[type].currentTime = 0;
        this.bgm[type].play().catch(error => {
            // エラーを無視して続行
        });
    },

    playSFX(type) {
        this.sfx[type].currentTime = 0;
        this.sfx[type].play();
    }
};