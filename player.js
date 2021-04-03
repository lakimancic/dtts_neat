const c = document.getElementById("myCanvas");
const ctx = c.getContext("2d");

ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

const bird = new Image();
bird.src = "images/bird.png";
const spike = new Image();
spike.src = "images/spike.png";

const GRAV = 0.2; // GRAVITY
let timer = null;
let gameReady = true;
let spikes = [];
let highScore = 0;

// CLASSES

class Spike {
    constructor(y, left) {
        this.y = y;
        this.left = left;
    }

    draw() {
        ctx.save();
        if (this.left) {
            ctx.translate(2 * (this.left ? c.width - 5 - 22.5 : 5) + 22.5, 0);
            ctx.scale(-1, 1);
        }
        if (spike.complete) {
            ctx.drawImage(spike, (this.left ? c.width - 5 - 22.5 : 5), this.y, spike.width * 0.5, spike.height * 0.5);
        }
        else {
            ctx.fillRect((this.left ? c.width - 5 - 22.5 : 5), this.y, 22.5, 38);
        }
        ctx.restore();
    }
}

class Bird {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;

        this.vx = speed;
        this.vy = 0;

        this.alive = true;
        this.score = 0;

        this.left = false;

        this.numOfSpikes = 4;
    }

    draw() {
        ctx.save();
        if (this.left) {
            ctx.translate(2 * this.x + 50.5, 0);
            ctx.scale(-1, 1);
        }
        if (bird.complete) {
            ctx.drawImage(bird, this.x, this.y, bird.width * 0.5, bird.height * 0.5);
        }
        else {
            ctx.fillRect(this.x, this.y, 50.5, 33);
        }
        ctx.restore();
    }

    update() {
        if (this.alive) {

            this.x += this.vx;
            this.y += this.vy;

            this.vy += GRAV;

            // WALL COLLISION
            if ((this.x + 50.5 + this.vx > c.width - 5) || (this.x + this.vx < 5)) {
                if (this.score == 10) {
                    this.numOfSpikes = 5;
                    this.vx += (this.vx > 0 ? 0.5 : -0.5);
                }
                else if (this.score == 25) {
                    this.numOfSpikes = 6;
                    this.vx += (this.vx > 0 ? 0.5 : -0.5);
                }
                else if (this.score == 40) {
                    this.numOfSpikes = 7;
                    this.vx += (this.vx > 0 ? 0.5 : -0.5);
                }
                spikes = createSpikes(this.numOfSpikes, this.left);
                document.getElementById("score").textContent = this.score + 1;
            }
            if (this.x + 50.5 + this.vx > c.width - 5) {
                this.score++;
                this.x = c.width - 5 - 50.5;
                this.left = !this.left;
                this.vx *= -1;
            }
            if (this.x + this.vx < 5) {
                this.score++;
                this.x = 5;
                this.left = !this.left;
                this.vx *= -1;
            }

            // TOP AND BOTTOM SPIKES COLLISION
            if (this.y + 33 > c.height - 87 || this.y < 35) {
                document.getElementById("msg").textContent = "Game over! Press R to play again.";
                gameReady = false;
                this.alive = false;
                clearInterval(timer);
                timer = null;
                if (this.score > highScore) highScore = this.score;
                document.getElementById("hscore").textContent = highScore;
                document.getElementById("score").textContent = 0;
            }
        }
    }

    jump() {
        this.vy = -4;
    }

    collision(spike) {
        let t1 = { x: (spike.left ? c.width - 5 : 5), y: spike.y };
        let t2 = { x: (spike.left ?  c.width - 27.5 : 27.5), y: spike.y + 19 };
        let t3 = { x: (spike.left ? c.width - 5 : 5), y: spike.y + 38 };

        let xprom = this.left ? this.x + 10  : this.x + 40.5;

        if((xprom > t1.x && xprom < t2.x) || (xprom < t1.x && xprom > t2.x)){
            let y1 = (t1.y - t2.y)*xprom/(t1.x - t2.x) - (t1.y - t2.y)*t2.x/(t1.x - t2.x) + t2.y;
            let y2 = (t3.y - t2.y)*xprom/(t3.x - t2.x) - (t3.y - t2.y)*t2.x/(t3.x - t2.x) + t2.y;

            if((y1 > this.y && y1 < this.y + 33) || (y2 > this.y && y2 < this.y + 33)){
                document.getElementById("msg").textContent = "Game over! Press R to play again.";
                gameReady = false;
                this.alive = false;
                clearInterval(timer);
                timer = null;
                if (this.score > highScore) highScore = this.score;
                document.getElementById("hscore").textContent = highScore;
                document.getElementById("score").textContent = 0;
            }
        }

        return false;
    }
}

// GAME ELEMENTS

let player = new Bird(c.width / 2 - bird.width / 4, 250, 2);

// SIDE METHODS

const createSpikes = (num, left) => {
    let spikes = [];

    for (let i = 0; i < 11; i++) {
        spikes.push(0);
    }

    for (let i = 0; i < num; i++) {
        let ind = Math.floor(Math.random() * 11);
        if (spikes[ind] != 0) {
            i--;
            continue;
        }
        spikes[ind] = new Spike(15 + ind * 46.5, left);
    }

    return spikes;
}

// MAIN METHODS

const update = () => {
    if (player.alive) {
        if (spikes) {
            spikes.forEach(item => {
                player.collision(item);
            });
        }

        player.update();
    }
};

const render = () => {
    ctx.clearRect(0, 0, c.width, c.height);

    player.draw();

    if (spikes) {
        spikes.forEach(item => {
            if (item != 0) item.draw();
        })
    }
};

const mainLoop = () => {
    update();
    render();
};

// PLAYER EVENTS

window.onkeypress = (e) => {
    e = e || event;
    if (e.key == 'r') {
        if (!gameReady) {
            gameReady = true;
            document.getElementById("msg").textContent = "Press Space to start game";
            player = new Bird(c.width / 2 - bird.width / 4, 250, 2);
            spikes = [];
            render();
        }
    }
    if (e.which == 32) {
        if (player.alive && timer) {
            player.jump();
        }
        if (!timer && gameReady) {
            timer = setInterval(mainLoop, 1000 / 60);
            document.getElementById("msg").textContent = "Playing game";
            player.jump();
        }
    }
};

bird.onload = render;