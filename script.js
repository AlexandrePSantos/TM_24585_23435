// Início do jogo 
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

// Inimigos e as Naves Pequenas
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

// Efeitos sonoros com uso do Howler (ferramenta extra para phaser)
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

// assets
function preload() {
    this.load.image("mFalcon", "asset/falcon.png")
    this.load.image("tiefigther", "asset/tief.png")
    this.load.image("laser", "asset/laser_azul.png")
    this.load.image("laser_v", "asset/laser_vermelho.png")
    this.load.image("deathstar", "asset/deathstar.png")
    this.load.image("background", "asset/back.jpg")
    this.load.image("titulo", "asset/titulo.png")
}

// Variáveis 
var score = 0;
var level = 1;
var lives = 3;
var isStarted = false;
var figtherCount = 0;

// Background e inputs
function create() {
    //Imagem de background 
    this.add.image(400, 300, 'background');    
    scene = this;
    //Inputs de movimento
    cursors = scene.input.keyboard.createCursorKeys();
    keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    //incializar disparo como falso enquanto não carregado
    isShooting = false;
    //tecla de disparo 'Space'
    scene.input.keyboard.addCapture('SPACE');
    //Adicionar enemy
    enemies = scene.physics.add.staticGroup();
    //colisão dos elementos de jogo
    playerCollision = scene.add.rectangle(0, 0, 800, 10, 0x000).setOrigin(0)
    figtherCollision = scene.add.rectangle(0, 590, 800, 10, 0x000).setOrigin(0)
    deathstarCollision = scene.add.rectangle(790, 0, 10, 600, 0x000).setOrigin(0)
    scene.physics.add.existing(playerCollision)
    scene.physics.add.existing(figtherCollision)
    scene.physics.add.existing(deathstarCollision)
    //adicionar asset do player
    player = scene.physics.add.sprite(400, 560, 'mFalcon');
    //limites de onde o player pode ir
    player.setCollideWorldBounds(true)

    //texto no topo do jogo de score, nivel(Tem bug) e vidas do player
    levelText = scene.add.text(330, 16, "Level: " + level, { fontSize: '18px', fill: '#FFF' })
    scoreText = scene.add.text(16, 16, "Score: " + score, { fontSize: '18px', fill: '#FFF' })
    livesText = scene.add.text(696, 16, "Lives: " + lives, { fontSize: '18px', fill: '#FFF' })
    //titulo do menu
    menu = scene.add.image(400, 300, 'titulo'); 

    //disparar
    scene.input.keyboard.on('keydown-SPACE', shoot);
    
    //iniciar o jogo carregando na tecla 'space'
    scene.input.keyboard.on('keydown-SPACE', function () {
        if (isStarted == false) {
            isStarted = true;
            menu.destroy()
            setInterval(makedeathstar, 5000)
        } else {
            shoot()
        }
    });
    initEnemys()
}

// Movimento do Player
function update() {
    if (isStarted == true) {
        // Velocidade do Player para a esquerda ao pressionar A
        if (cursors.left.isDown || keyA.isDown) {
            player.setVelocityX(-180);

        }
        // Velocidade do Player para a direita ao pressionar D 
        else if (cursors.right.isDown || keyD.isDown) {
            player.setVelocityX(180);

        }
        else {
            // Posição fixa quando teclas nao sao carregadas
            player.setVelocityX(0);

        }
    }
}

// Função disparar
function shoot() {
    if (isStarted == true) {
        if (isShooting === false) {
            //inserir asset do laser
            managelaser(scene.physics.add.sprite(player.x, player.y, "laser"))
            //ativar disparo
            isShooting = true;
            //Som de disparo
            shootSound.play()
        }
    }
}

// Função de Atirar do Inimigo
function shoot_enemy() {
    if (isStarted == true) {
        if (isShooting === false) {
            //inserir asset do laser do enemy
            managelaser_v(scene.physics.add.sprite(player.x, player.y, "laser_v"))
            //ativar disparo
            isShooting = true;
            //Som de disparo
            shootSound.play()
        }
    }
}

// Posição Inicial do Inimigo
function initEnemys() {
    //gerar inimigos(linhas e colunas)
    for (c = 0; c < enemyInfo.count.col; c++) {
        for (r = 0; r < enemyInfo.count.row; r++) {
            var enemyX = (c * (enemyInfo.width + enemyInfo.padding)) + enemyInfo.offset.left;
            var enemyY = (r * (enemyInfo.height + enemyInfo.padding)) + enemyInfo.offset.top;
            //espaçamento de inimigos
            enemies.create(enemyX, enemyY, 'tiefigther').setOrigin(0.5);
        }
    }
}

// Movimento dos Inimigos
//intervalo de movimento 0.75 segundos
setInterval(moveenemies, 750)
var xTimes = 0;
var yTimes = 0;
var dir = "right"
//função de movimento
function moveenemies() {
    //iniciar sequencia de movimento com som
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
        //distancia de movimento direita e esquerda em função do eixo x
        if (dir === "right") {
            enemies.children.each(function (enemy) {

                enemy.x = enemy.x + 10;
                enemy.body.reset(enemy.x, enemy.y);

            }, scene);
            xTimes++;
        } else {
            enemies.children.each(function (enemy) {

                enemy.x = enemy.x - 10;
                enemy.body.reset(enemy.x, enemy.y);

            }, scene);
            xTimes++;

        }
    }
}

    // Player
// Gerir os lasers
function managelaser(laser) {
    //velocidade laser player
    laser.setVelocityY(-380);

    var i = setInterval(function () {
        enemies.children.each(function (enemy) {
            // Verificar se entra em contacto com laser
            if (checkOverlap(laser, enemy)) {
                // Destruir o asset quando entra em contacto com inimigo
                laser.destroy(); 
                clearInterval(i)
                isShooting = false
                // Destruir inimigo quand entra em contacto com asset do laser
                enemy.destroy()
                // Player recebe 1 score por cada inimigo destruido
                score++;
                // Inserir score no ecrã
                scoreText.setText("Score: " + score); // Adicionar pontução
                
                level = ((score - (score%5))/5 + 1);
                levelText.setText("Level: " + level);
                enemylaserVelo = 200 + 2;

                // Som ao destruir
                explosionSound.play()
                // se nmr de naves destruidas for igual ao score ganha
                    if ((score - figtherCount) === (enemyInfo.count.col * enemyInfo.count.row)) {
                        end("Win")
                    }
            }
        }, scene);
        
        // Ciclo para gerar inimigo maior
        for (var step = 0; step < deathstars.length; step++) {
            var deathstar = deathstars[step];
            // Verificar se entra em contacto com laser
            if (checkOverlap(laser, deathstar)) {
                // Destroi asset laser
                laser.destroy();
                clearInterval(i)
                isShooting = false
                // Apresenta score
                scoreText.setText("Score: " + score);
                // Som ao ser destruida
                explosionSound.play()
                // Destroi asset nave grande
                deathstar.destroy()
                // Atualiza estado da variavel
                deathstar.isDestroyed = true;
                // Para som quando nave é destruida
                deathstarSound.stop();
                // Aumenta Score
                score++;
                
                level = ((score - (score%5))/5 + 1);
                levelText.setText("Level: " + level);
                enemylaserVelo = 200 + 2;
                
                // Aumenta contagem de naves destruidas
                figtherCount = figtherCount + 2;;
            }
        }
    }, 10)
    //Colisão com player
    scene.physics.add.overlap(laser, playerCollision, function () {
        // Destroi asset do laser
        laser.destroy();
        clearInterval(i);
        // Som ao destruir
        explosionSound.play();
        isShooting = false
    })
}

// Velocidade do Laser do inimigo
var enemylaserVelo = 200;

// Gerir laser inimigo
function manageEnemylaser(laser, enemy) {
    var angle = Phaser.Math.Angle.BetweenPoints(enemy, player);
    // Velocidade do laser inimigo
    scene.physics.velocityFromRotation(angle, enemylaserVelo, laser.body.velocity);
/*    // Atribui velocidade inicial de movimento ao laser inimigo
    enemylaserVelo = enemylaserVelo + 2*/

    var i = setInterval(
    function () {
        // Verificar overlap de laser e player
        if (checkOverlap(laser, player)) {
            laser.destroy();
            clearInterval(i);
            // Reduzir vidas quando existe colisão
            lives--;
            livesText.setText("Lives: " + lives);
            explosionSound.play()
            // Se vidas chegarem a 0 acaba o jogo
            if (lives == 0) {
                end("Lose")
            }
        }
    }, 10)
    //Colisao com inimigo pequeno
    scene.physics.add.overlap(laser, figtherCollision, function () {
        laser.destroy();
        explosionSound.play();
        clearInterval(i);
    })

}

// Limites do ecrã
function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
}

// Intervalo entre disparo dos inimigos
setInterval(enemyFire, 1500)
// Atribuir asset ao disparo do inimigo
function enemyFire() {
    if (isStarted === true) {
        var enemy = enemies.children.entries[Phaser.Math.Between(0, enemies.children.entries.length - 1)];
        manageEnemylaser(scene.physics.add.sprite(enemy.x, enemy.y, "laser_v"), enemy)
    }
}     

// Atribui Asset a naves grandes e onde dão spawn
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
                manageEnemylaser(scene.physics.add.sprite(deathstar.x, deathstar.y, "laser_v"), deathstar)

            } else {
                deathstars.splice(i, 1);
            }
        }
    }

}, 2000)

// Dar spawn à nave grande
function managedeathstar(deathstar) {
    deathstars.push(deathstar);
    deathstar.isDestroyed = false;
    // Velocidade da nave grande
    deathstar.setVelocityX(100);
    // Colisao da nave grande para desativar som
    scene.physics.add.overlap(deathstar, deathstarCollision, function () {
        deathstar.destroy()
        deathstar.isDestroyed = true;
        deathstarSound.stop()
    })
    // Se nave nao for destruida mantem som ligado enquanto estiver no ecra
    deathstarSound.play()
}

// Acabar o jogo
function end(con) {
    // Termina sons
    explosionSound.stop();
    deathstarSound.stop();
    shootSound.stop();
    move.stop()
    // Alert com o score final
    alert(`You ${con}! Score: ` + score);
    location.reload()
}