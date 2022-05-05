//---Variaveis---
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'jogo',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var enemyInfo = {
    width: 40,
    height: 20,
    count: {
        row: 5,
        col: 9
    },
    offset: {
        top: 100,
        left: 60
    },
    padding: 5
};

var game = new Phaser.Game(config);

var score = 0;
var lives = 3;
var isStarted = false;
var figtherCount = 0;

function preload(){
    //Carregar assets
    this.load.image("mFalcon", "asset/falcon.png")
    this.load.image("tiefigther", "asset/tief.png")
    this.load.image("laser", "asset/laser_azul.png")
    this.load.image("deathstar", "asset/deathstar.png")
    this.load.image("background", "asset/back.jpg")
}

//---Funções---
function create(){
    //Adicionar background
    this.add.image(400, 300, 'background');
    
    scene = this;
    //Teclas de movimento
    cursors = scene.input.keyboard.createCursorKeys();
    keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    //Tecla de disparo
    isShooting = false;
    scene.input.keyboard.addCapture('SPACE');
    
    //Colisão dos elementos de jogo
    enemies = scene.physics.add.staticGroup();
    playerCollision = scene.add.rectangle(0, 0, 800, 10, 0x000).setOrigin(0)
    figtherCollision = scene.add.rectangle(0, 590, 800, 10, 0x000).setOrigin(0)
    deathstarCollision = scene.add.rectangle(790, 0, 10, 600, 0x000).setOrigin(0)
    scene.physics.add.existing(playerCollision)
    scene.physics.add.existing(figtherCollision)
    scene.physics.add.existing(deathstarCollision)

    //Adicionar sprite do player e adicionar a colisão
    player = scene.physics.add.sprite(400, 560, 'mFalcon');
    player.setCollideWorldBounds(true)

    //Texto do score e vidas + titulo do jogo
    scoreText = scene.add.text(16, 16, "Score: " + score, { fontSize: '18px', fill: '#FFF' })
    livesText = scene.add.text(696, 16, "Lives: " + lives, { fontSize: '18px', fill: '#FFF' })
    menu = this.add.image(400, 300, 'titulo'); 

    //atribuir ação de disparo á tecla 'space'
    this.input.keyboard.on('keydown-SPACE', shoot);

    //Ecrã inicial com titulo quando carregado começa o jogo
    this.input.on('pointerdown', function () {
        if (isStarted == false) {
            isStarted = true;
            menu.destroy()
            setInterval(makedeathstar, 15000)
        } else {
            shoot()
        }
    });
    initEnemys()
}

function update(){
    //

}