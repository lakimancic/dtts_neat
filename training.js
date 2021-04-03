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
let spikes = [];
let birds = [];
let prevscore = 0;
let spikeleft = true;
let generation = 0;
let numOfSpikes = 4;

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

        this.fitness = 0;
        this.brain = new BirdNN();

        this.speed = speed;
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
            this.fitness = Number(this.fitness) + Number(this.speed);

            // TOP AND BOTTOM SPIKES COLLISION
            if (this.y + 33 > c.height - 87 || this.y < 35) this.alive = false;
        }
    }

    jump() {
        this.vy = -4;
    }

    collision(spike) {
        let t1 = { x: (spike.left ? c.width - 5 : 5), y: spike.y };
        let t2 = { x: (spike.left ? c.width - 27.5 : 27.5), y: spike.y + 19 };
        let t3 = { x: (spike.left ? c.width - 5 : 5), y: spike.y + 38 };

        let xprom = this.left ? this.x + 10 : this.x + 40.5;

        if ((xprom > t1.x && xprom < t2.x) || (xprom < t1.x && xprom > t2.x)) {
            let y1 = (t1.y - t2.y) * xprom / (t1.x - t2.x) - (t1.y - t2.y) * t2.x / (t1.x - t2.x) + t2.y;
            let y2 = (t3.y - t2.y) * xprom / (t3.x - t2.x) - (t3.y - t2.y) * t2.x / (t3.x - t2.x) + t2.y;

            if ((y1 > this.y && y1 < this.y + 33) || (y2 > this.y && y2 < this.y + 33)) this.alive = false;
        }

        return false;
    }

    mate(bird2) {
        let newbird = new Bird(c.width / 2 - bird.width / 4, 250, 2);
        newbird.brain = this.brain.mate(bird2.brain);
        return newbird;
    }
}

// CREATING BIRDS POPULATION

for (let i = 0; i < 100; i++) {
    birds.push(new Bird(c.width / 2 - bird.width / 4, 250, 2));
}

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
};

const compare = (a, b) => {
    if (a.fitness < b.fitness) return 1;
    else if (a.fitness > b.fitness) return -1;
    return 0;
};

const calculate = (hor, h) => {
    let miny, maxy;
    let pomr = [];
    let i = 0;
    while (i < hor.length) {
        if (hor[i] == 0) {
            miny = i;
            while (hor[i] == 0 && i < hor.length) {
                i++;
            }
            pomr.push({ f: miny, l: i - 1 });
        }
        i++;
    }
    let dis = 0, pos;
    pomr.forEach((item) => { // 15 + ind * 46.5
        if (Math.abs(Math.max(15 + (item.f - 1) * 46.5 + 38, 35) - Math.min(15 + (item.l + 1) * 46.5, c.height - 87)) > dis) {
            pos = { k: Math.max(15 + (item.f - 1) * 46.5 + 38, 35), n: Math.min(15 + (item.l + 1) * 46.5, c.height - 87) };
            dis = Math.abs(Math.max(15 + (item.f - 1) * 46.5 + 38, 35) - Math.min(15 + (item.l + 1) * 46.5, c.height - 87));
        }
        if (Math.abs(Math.max(15 + (item.f - 1) * 46.5 + 38, 35) - Math.min(15 + (item.l + 1) * 46.5, c.height - 87)) == dis){
            let sr1 = (pos.k + pos.n)/2;
            let sr2 = (Math.max(15 + (item.f - 1) * 46.5 + 38, 35) + Math.min(15 + (item.l + 1) * 46.5, c.height - 87))/2;
            if(Math.abs(sr1 - h) > Math.abs(sr2 - h)) pos = { k: Math.max(15 + (item.f - 1) * 46.5 + 38, 35), n: Math.min(15 + (item.l + 1) * 46.5, c.height - 87) };
        }
    })
    //clearInterval(timer);
    return pos;
};

// MAIN METHODS

const update = () => {
    let alives = 0;
    let pScore = false;

    birds.forEach((item) => {
        spikes.forEach(sp => {
            if (sp != 0) {
                item.collision(sp);
            }
        });
        item.update();

        if (item.alive) {
            let input = [];
            input.push(Number(item.left ? item.x : (c.width - item.x - 50.5)));
            input.push(item.y);
            let hor = [];
            if (spikes.length > 0) {
                spikes.forEach(item => {
                    if (item != 0) hor.push(1);
                    else hor.push(0);
                });
            }
            else {
                for (let i = 0; i < 11; i++) hor.push(0);
            }
            input.push(calculate(hor,item.y).k);
            input.push(calculate(hor,item.y).n);
            let isJump = item.brain.forward(input);

            if (isJump > 0) {
                item.jump();
            }
            alives++;
        }
        if (item.score > prevscore) {
            prevscore = item.score;
            pScore = true;
        }
    });
    if (pScore) {
        // if(prevscore < 10) spikes = createSpikes(4, spikeleft);
        // else spikes = createSpikes(5, spikeleft);
        if (prevscore == 10) {
            numOfSpikes = 5;
        }
        else if (prevscore == 25) {
            numOfSpikes = 6;
        }
        else if (prevscore == 40) {
            numOfSpikes = 7;
        }
        spikes = createSpikes(numOfSpikes, !spikeleft);
        spikeleft = !spikeleft;
        document.getElementById("score").textContent = prevscore;
    }
    if (alives == 0) {
        birds.sort(compare);
        newbirds = [];
        for (let i = 0; i < birds.length / 10; i++) {
            let newbird = new Bird(c.width / 2 - bird.width / 4, 250, 2);
            newbird.brain = birds[i].brain;
            newbirds.push(newbird);
        }
        for (let i = 0; i < birds.length * 9 / 10; i++) {
            let len = birds.length;
            let r = Math.floor(Math.random() * len / 10);
            let par1 = birds[r];
            r = Math.floor(Math.random() * len / 10);
            let par2 = birds[r];
            newbirds.push(par1.mate(par2));
        }
        birds = [...newbirds];

        spikes = [];
        prevscore = 0;
        numOfSpikes = 4;
        spikeleft = true;
        generation++;
        document.getElementById("gen").innerHTML = generation;
    }
    document.getElementById("alive").textContent = alives;
};

const render = () => {
    ctx.clearRect(0, 0, c.width, c.height);

    birds.forEach(item => {
        if (item.alive) item.draw();
    });
    let hor = [];
    if (spikes) {
        spikes.forEach(item => {
            if (item != 0) item.draw();
        });
    }
};

const mainLoop = () => {
    update();
    render();
};

window.onkeypress = (e) => {
    e = e || event;
    if (e.which == 32) {
        if(timer){
            clearInterval(timer);
            timer = null;
            document.getElementById("msg").textContent = "Press Space to continue evolution.";
        }
        else{
            timer = setInterval(mainLoop, 1000 / 60);
            document.getElementById("msg").textContent = "Press Space to pause evolution.";
        }
    }
};