const EnemyTypes = {
    slime: {
        name: 'Slime',
        baseHp: 200,
        attack: 5,
        defense: 2,
        speed: 0.5,
        imageSrc: './pic/slime.jpg'
    },
    goblin: {
        name: 'Goblin',
        baseHp: 30,
        attack: 8,
        defense: 3,
        speed: 0.8,
        imageSrc: './pic/goblin.jpg'
    },
}

function generateEnemyHp(baseHp) {
    return baseHp + Math.floor(Math.random() * 15) - 7;
}