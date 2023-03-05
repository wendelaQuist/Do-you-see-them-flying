// https://github.com/wendelaQuist/Do-you-see-them-flying

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight; 

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const boldScore = document.querySelector('#bold-score');

var images = []

drawing = new Image();
drawing.src = "small-spaceship-01.png";

let controllerIndex = null;
let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;

class Player {
    constructor(x, y, radius, color, velocity) {
        this.x          = x
        this.y          = y
        this.radius     = radius
        this.color      = color
        this.velocity   = velocity
        this.shoot      = 0
    }

    draw() {
        c.drawImage(drawing,(player.x-(drawing.width/2)),(player.y-(drawing.height/2)));
        
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        if (this.x < 0) {
            this.x = canvas.width;
        } else if(this.x > canvas.width){
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = canvas.height;
        } else if(this.y > canvas.height){
            this.y = 0;
        }
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x          = x
        this.y          = y
        this.radius     = radius
        this.color      = color
        this.velocity   = velocity
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x          = x
        this.y          = y
        this.radius     = radius
        this.color      = color
        this.velocity   = velocity
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x          = x
        this.y          = y
        this.radius     = radius
        this.color      = color
        this.velocity   = velocity
        this.alpha      = 1
    }
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 30, "URL('Spaceship')", {x:0, y:0});

const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', {
    x: 1,
    y: 1
});

const projectile2 = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'green', {
    x: -1,
    y: -1
});

let projectiles = [];
let enemies = [];
let particles = [];
let StopRecurve = 0;

function init() {
    player = new Player(x, y, 30, "URL('Spaceship')", {x:0, y:0});
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    boldScore.innerHTML = score;
    gameTime = 2000;
}

let gameTime = 2000;

function spawnEnemies() {
    StopRecurve = 1;
    setTimeout(() => { 
        const radius = Math.random() * (30 - 8) + 8;

        let x;
        let y;

        x         = Math.random() * canvas.width;
        y         = 0;
        
        
        const color     = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(player.y - y, player.x - x );
        const velocity = {x: (Math.cos(angle) * 5), y: (Math.sin(angle) * 5 )};

        enemies.push(new Enemy(x, y, radius, color, velocity));
        if (gameTime > 500) {
            gameTime -= 20;
        }
        spawnEnemies();
    }, gameTime); 
}

let animationId;
let score = 0;

function animate() {
    animationID = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1);
        }
        else{
            particle.update();
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        if (projectile.x + projectile.radius < 0 || 
            projectile.x - projectile.radius > canvas.width || 
            projectile.y + projectile.radius < 0            || 
            projectile.y - projectile.radius > canvas.height
            ) {
            setTimeout (() => {
                projectiles.splice(index, 1);
            }, 0)
        }
    })
        enemies.forEach((enemy, index) => {
            enemy.update();

            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

            if(dist - enemy.radius - player.radius < 1){ // Enemy collides with player

                cancelAnimationFrame(animationID); // stop game  
                modalEl.style.display = 'flex'; 
                boldScore.innerHTML = score;   

                gamepadVibration();
            }

            projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            if(dist - enemy.radius - projectile.radius < 1) { // if a projectile hits an enemy
                var audio = new Audio('boom.mp3');
                    audio.play();
                for (let i=0; i < enemy.radius * 2; i ++){ // create explosion
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 7), y: (Math.random() - 0.5) * (Math.random() * 7)}));
                }

                if (enemy.radius - 10 > 5) {

                    score += 100;//add to score
                    scoreEl.innerHTML = score;
                    enemy.radius -= 10;
                    setTimeout (() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0)
                }
                else{ //remove whole projectile
                    setTimeout (() => {
                        score += 250;
                        scoreEl.innerHTML = score;
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0)
                }
            }
        })
    })
}

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
    const velocity = {x: Math.cos(angle) * 5, y: Math.sin(angle) * 5};
    projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity));
    var audio = new Audio('pew.mp3');
    audio.play();
})

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    modalEl.style.display = 'none';
    gameLoop();
    if (StopRecurve == 0){
        spawnEnemies();
    }
})

window.addEventListener("gamepadconnected", (event) => {
    controllerIndex = event.gamepad.index;
    console.log("connected");
  });
  
  window.addEventListener("gamepaddisconnected", (event) => {
    console.log("disconnected");
    controllerIndex = null;
});
  
function controllerInput() {
  if (controllerIndex !== null) {
    const gamepad = navigator.getGamepads()[controllerIndex];

    const buttons = gamepad.buttons;
    upPressed = buttons[12].pressed;
    downPressed = buttons[13].pressed;
    leftPressed = buttons[14].pressed;
    rightPressed = buttons[15].pressed;

    const stickDeadZone = 0.4;
    const leftRightValue = gamepad.axes[0];

    if (leftRightValue >= stickDeadZone) {
      rightPressed = true;
      player.velocity.x = 5;
    } else if (leftRightValue <= -stickDeadZone) {
      leftPressed = true;
      player.velocity.x = -5;
    } else {
        leftPressed = false;
        rightPressed = false;
        player.velocity.x = 0;
    }

    const upDownValue = gamepad.axes[1];

    if (upDownValue >= stickDeadZone) {
      downPressed = true;
      player.velocity.y = 5;
    } else if (upDownValue <= -stickDeadZone) {
      upPressed = true;
      player.velocity.y = -5;
    } else {
        upPressed = false;
        downPressed = false;
        player.velocity.y = 0;
    }

    APressed = buttons[0].pressed;
    BPressed = buttons[1].pressed;
    XPressed = buttons[2].pressed;
    YPressed = buttons[3].pressed;

    if(APressed == 1 || BPressed == 1 || XPressed == 1 || YPressed == 1 ) {
        player.shoot += 1;
        if (player.shoot >= 20){
            const velocity = {x: 0, y: -10 };
            projectiles.push(new Projectile(player.x - 30, player.y, 5, 'white', velocity));
            projectiles.push(new Projectile(player.x + 30, player.y, 5, 'white', velocity));
            var audio = new Audio('pew.mp3');
            audio.play();
            player.shoot = 0;
        }
    }
  }
}

function gamepadVibration () {
    let gamepad = navigator.getGamepads()[0];

    gamepad.vibrationActuator.playEffect("dual-rumble", {
      startDelay: 0,
      duration: 300,
      weakMagnitude: 1.0,
      strongMagnitude: 1.0,
    });
}

addEventListener('keydown', (event) => {
    if(event.key === 'a' ){
        player.velocity.x = -5;
    }
    if(event.key === 's' ){
        player.velocity.y = 5;
    }
    if(event.key === 'd' ){
        player.velocity.x = 5;
    }
    if(event.key === 'w' ){
        player.velocity.y = -5;
    }
})

addEventListener('keyup', (event) => {
    if(event.key === 'a' ){
        player.velocity.x = 0;
    }
    if(event.key === 's' ){
        player.velocity.y = 0;
    }
    if(event.key === 'd' ){
        player.velocity.x = 0;
    }
    if(event.key === 'w' ){
        player.velocity.y = 0;
    }
})

function gameLoop() {
    controllerInput();
    requestAnimationFrame(gameLoop);
}

