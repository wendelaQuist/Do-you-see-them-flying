const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight; 

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const boldScore = document.querySelector('#bold-score');

class Player {
    constructor(x, y, radius, color, velocity) {
        this.x      = x
        this.y      = y
        this.radius = radius
        this.color  = color
        this.velocity = velocity
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

const player = new Player(x, y, 30, 'white', {x:0, y:0});

const projectile = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', {
    x: 1,
    y: 1
});

const projectile2 = new Projectile(canvas.width / 2, canvas.height / 2, 5, 'green', {
    x: -1,
    y: -1
});

const projectiles = [];
const enemies = [];
const particles = [];

function spawnEnemies() {
    setInterval(() => { 
        const radius = Math.random() * (30 - 8) + 8;

        let x;
        let y;

        if(Math.random() < 0.5) {
            x         = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y         = Math.random() * canvas.height;
        }
        else{
            x         = Math.random() * canvas.width;
            y         = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color     = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(player.y - y, player.x - x );
        const velocity = {x: Math.cos(angle), y: Math.sin(angle)};

        enemies.push(new Enemy(x, y, radius, color, velocity))
        console.log(player.x)
    }, 1000); 
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
            }

            projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            if(dist - enemy.radius - projectile.radius < 1) { // if a projectile hits an enemy

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
    projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity))
})
startGameBtn.addEventListener('click', () => {
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
})


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