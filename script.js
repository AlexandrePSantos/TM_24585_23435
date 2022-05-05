//inicio do jogo 
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

var game = new Phaser.Game(config);

//inimigos e as naves pequeninas
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


//música de fundo
var move = new Howl({
    src: ['asset/move.mp3']
});

var shootSound = new Howl({
    src: ['asset/shoot.mp3']
});

var explosionSound = new Howl({
    src: ['asset/explosion.mp3']
});

var deathstarSound = new Howl({
    src: ['asset/deathstar.mp3'],
    loop: true
});

var backmusic = new Howl({
    src: ['asset/impmarch.mp3'],
    autoplay: true,
    loop: true
});

//imagens/icons
function preload() {
    this.load.image("mFalcon", "asset/falcon.png")
    this.load.image("tiefigther", "asset/tief.png")
    this.load.image("laser", "asset/laser_azul.png")
    this.load.image("deathstar", "asset/deathstar.png")
    this.load.image("background", "asset/back.jpg")
    this.load.image("titulo", "asset/titulo.png")
}

//variaveis de score e vida
var score = 0;
var level = 1;
var lives = 3;
var isStarted = false;
var figtherCount = 0;



function create() {
    this.add.image(400, 300, 'background');    
    scene = this;
    cursors = scene.input.keyboard.createCursorKeys();
    keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    isShooting = false;
    scene.input.keyboard.addCapture('SPACE');
    enemies = scene.physics.add.staticGroup();
    playerCollision = scene.add.rectangle(0, 0, 800, 10, 0x000).setOrigin(0)
    figtherCollision = scene.add.rectangle(0, 590, 800, 10, 0x000).setOrigin(0)
    deathstarCollision = scene.add.rectangle(790, 0, 10, 600, 0x000).setOrigin(0)
    scene.physics.add.existing(playerCollision)
    scene.physics.add.existing(figtherCollision)
    scene.physics.add.existing(deathstarCollision)

    player = scene.physics.add.sprite(400, 560, 'mFalcon');
    player.setCollideWorldBounds(true)

    levelText = scene.add.text(330, 16, "Level: " + level, { fontSize: '18px', fill: '#FFF' })
    scoreText = scene.add.text(16, 16, "Score: " + score, { fontSize: '18px', fill: '#FFF' })
    livesText = scene.add.text(696, 16, "Lives: " + lives, { fontSize: '18px', fill: '#FFF' })
    menu = this.add.image(400, 300, 'titulo'); 

    this.input.keyboard.on('keydown-SPACE', shoot);

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

function update() {
    if (isStarted == true) {
        if (cursors.left.isDown || keyA.isDown) {
            player.setVelocityX(-160);

        }
        //velocidade da nave do jogo (jogador)  
        else if (cursors.right.isDown || keyD.isDown) {
            player.setVelocityX(160);

        }
        else {
            //posição de inicio do jogador 
            player.setVelocityX(0);

        }
    }
}

function shoot() {
    if (isStarted == true) {
        if (isShooting === false) {
            managelaser(scene.physics.add.sprite(player.x, player.y, "laser"))
            isShooting = true;
            shootSound.play()
        }
    }
}

function initEnemys() {
    for (c = 0; c < enemyInfo.count.col; c++) {
        for (r = 0; r < enemyInfo.count.row; r++) {
            var enemyX = (c * (enemyInfo.width + enemyInfo.padding)) + enemyInfo.offset.left;
            var enemyY = (r * (enemyInfo.height + enemyInfo.padding)) + enemyInfo.offset.top;
            enemies.create(enemyX, enemyY, 'tiefigther').setOrigin(0.5);
        }
    }
}

setInterval(moveenemies, 1000)
var xTimes = 0;
var yTimes = 0;
var dir = "right"
function moveenemies() {
    if (isStarted === true) {
        move.play()
        if (xTimes === 20) {
            if (dir === "right") {
                dir = "left"
                xTimes = 0
            } else {
                dir = "right"
                xTimes = 0
            }
        }
        if (dir === "right") {
            enemies.children.each(function (enemy) {

                enemy.x = enemy.x + 10;
                enemy.body.reset(enemy.x, enemy.y);

            }, this);
            xTimes++;
        } else {
            enemies.children.each(function (enemy) {

                enemy.x = enemy.x - 10;
                enemy.body.reset(enemy.x, enemy.y);

            }, this);
            xTimes++;

        }
    }
}

function managelaser(laser) {
    //player
    laser.setVelocityY(-380);


    var i = setInterval(function () {
        enemies.children.each(function (enemy) {

            if (checkOverlap(laser, enemy)) {
                laser.destroy(); //destruir o inimigo
                clearInterval(i)
                isShooting = false
                enemy.destroy()
                score++;
                scoreText.setText("Score: " + score); //adicionar  pontução
                explosionSound.play()

                if ((score - figtherCount) === (enemyInfo.count.col * enemyInfo.count.row)) {
                    end("Win")
                }
            }

        }, this);

        for (var step = 0; step < deathstars.length; step++) {
            var deathstar = deathstars[step];
            if (checkOverlap(laser, deathstar)) {
                laser.destroy();
                clearInterval(i)
                isShooting = false

                scoreText.setText("Score: " + score);
              


                explosionSound.play()

                if ((score - figtherCount) === (enemyInfo.count.col * enemyInfo.count.row)) {
                    end("Win")
                }

                deathstar.destroy()
                deathstar.isDestroyed = true;
                deathstarSound.stop();
                score++;
                figtherCount++;
            }
        }
    }, 10)
    scene.physics.add.overlap(laser, playerCollision, function () {
        laser.destroy();
        clearInterval(i);
        explosionSound.play();
        isShooting = false
    })

}
var enemylaserVelo = 200;
function manageEnemylaser(laser, enemy) {
    var angle = Phaser.Math.Angle.BetweenPoints(enemy, player);
    scene.physics.velocityFromRotation(angle, enemylaserVelo, laser.body.velocity);
    enemylaserVelo = enemylaserVelo + 2
    var i = setInterval(function () {

        if (checkOverlap(laser, player)) {
            laser.destroy();
            clearInterval(i);
            lives--;
            livesText.setText("Lives: " + lives);
            explosionSound.play()

            if (lives == 0) {
                end("Lose")
            }
        }
    }, 10)
    scene.physics.add.overlap(laser, figtherCollision, function () {
        laser.destroy();
        explosionSound.play();
        clearInterval(i);
    })

}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
}

//Enemy Fire
setInterval(enemyFire, 3000)

function enemyFire() {
    if (isStarted === true) {
        var enemy = enemies.children.entries[Phaser.Math.Between(0, enemies.children.entries.length - 1)];
        manageEnemylaser(scene.physics.add.sprite(enemy.x, enemy.y, "laser"), enemy)
    }
}     

//Flying deathstars



var deathstars = [];
function makedeathstar() {
    if (isStarted == true) {
        managedeathstar(scene.physics.add.sprite(0, 60, "deathstar"));
    }
}

setInterval(function () {
    if (isStarted == true) {
        for (var i = 0; i < deathstars.length; i++) {
            var deathstar = deathstars[i];
            if (deathstar.isDestroyed == false) {
                manageEnemylaser(scene.physics.add.sprite(deathstar.x, deathstar.y, "laser"), deathstar)

            } else {
                deathstars.splice(i, 1);
            }
        }
    }

}, 2000)

function managedeathstar(deathstar) {
    deathstars.push(deathstar);
    deathstar.isDestroyed = false;
    deathstar.setVelocityX(100);
    scene.physics.add.overlap(deathstar, deathstarCollision, function () {
        deathstar.destroy()
        deathstar.isDestroyed = true;
        deathstarSound.stop()
    })
    deathstarSound.play()
}

function end(con) {
    explosionSound.stop();
    deathstarSound.stop();
    shootSound.stop();
    move.stop()

    alert(`You ${con}! Score: ` + score);
    location.reload()

}