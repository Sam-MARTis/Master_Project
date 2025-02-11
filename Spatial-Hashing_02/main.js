"use strict";
const canvas = document.getElementById("projectCanvas");
const info = document.getElementById("info");
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;
const ctx = canvas.getContext("2d");
//CONSTANTS
//Screen and background
const SCREEN_HEIGHT_OCCUPANCY = 0.9;
const SCREEN_WIDTH_OCCUPANCY = 0.9;
const BACKGROUND_COLOR = "black";
const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;
const CALC_TO_DISPLAY_RATIO = 3;
//Universe
const GRAVITY = 1000;
const dt = 1 / 2000;
const EPSILON = 0.0001;
const WALL_DAMPING = 1;
const INTERNAL_DAMPING = 1;
//Entities
const PARTICLE_COUNT = 8000;
const PARTICLE_RADIUS = Math.sqrt(SCREEN_HEIGHT * SCREEN_WIDTH) / 800;
const PARTICLE_COLOR = "red";
const PARTICLE_VELOCITY = 15;
// Early calculation
const ARENA_WIDTH_PIXELS = SCREEN_WIDTH * SCREEN_WIDTH_OCCUPANCY;
const ARENA_HEIGHT_PIXELS = SCREEN_HEIGHT * SCREEN_HEIGHT_OCCUPANCY;
const ARENA_X_OFFSET = (SCREEN_WIDTH - ARENA_WIDTH_PIXELS) / 2;
const ARENA_Y_OFFSET = (SCREEN_HEIGHT - ARENA_HEIGHT_PIXELS) / 2;
let time = performance.now();
let timeTaken = 0;
// Spatial Grid
const RADIUS_TO_SIDE_RATIO = 20;
const GRID_SIZE_DL = PARTICLE_RADIUS * RADIUS_TO_SIDE_RATIO;
const GRID_X = Math.ceil(ARENA_WIDTH_PIXELS / GRID_SIZE_DL);
const GRID_Y = Math.ceil(ARENA_HEIGHT_PIXELS / GRID_SIZE_DL);
let GRID = new Array(GRID_Y)
    .fill(null)
    .map(() => new Array(GRID_X).fill(null).map(() => []));
const initializeGrid = () => {
    GRID = new Array(GRID_Y)
        .fill(null)
        .map(() => new Array(GRID_X).fill(null).map(() => []));
};
// Classes
class Particle {
    constructor(x, y, vx, vy, radius, color, ctx) {
        this.handleBoundary = () => {
            if (this.x < this.radius + ARENA_X_OFFSET) {
                this.vx = -this.vx * WALL_DAMPING;
                this.x = this.radius + ARENA_X_OFFSET;
            }
            if (this.x > ARENA_WIDTH_PIXELS - this.radius + ARENA_X_OFFSET) {
                this.vx = -this.vx * WALL_DAMPING;
                this.x = ARENA_WIDTH_PIXELS - this.radius + ARENA_X_OFFSET;
            }
            if (this.y < this.radius + ARENA_Y_OFFSET) {
                this.vy = -this.vy * WALL_DAMPING;
                this.y = this.radius + ARENA_Y_OFFSET;
            }
            if (this.y > ARENA_HEIGHT_PIXELS - this.radius + ARENA_Y_OFFSET) {
                this.vy = -this.vy * WALL_DAMPING;
                this.y = ARENA_HEIGHT_PIXELS - this.radius + ARENA_Y_OFFSET;
            }
        };
        this.move = (dt) => {
            this.x += (this.vx * dt) / 2;
            this.y += (this.vy * dt) / 2;
            this.vx += this.ax * dt;
            this.vy += this.ay * dt;
            this.x += (this.vx * dt) / 2;
            this.y += (this.vy * dt) / 2;
            if (this.x < this.radius + ARENA_X_OFFSET) {
                this.vx = -this.vx * WALL_DAMPING;
                this.x = this.radius + ARENA_X_OFFSET;
            }
            if (this.x > ARENA_WIDTH_PIXELS - this.radius + ARENA_X_OFFSET) {
                this.vx = -this.vx * WALL_DAMPING;
                this.x = ARENA_WIDTH_PIXELS - this.radius + ARENA_X_OFFSET;
            }
            if (this.y < this.radius + ARENA_Y_OFFSET) {
                this.vy = -this.vy * WALL_DAMPING;
                this.y = this.radius + ARENA_Y_OFFSET;
            }
            if (this.y > ARENA_HEIGHT_PIXELS - this.radius + ARENA_Y_OFFSET) {
                this.vy = -this.vy * WALL_DAMPING;
                this.y = ARENA_HEIGHT_PIXELS - this.radius + ARENA_Y_OFFSET;
            }
            this.gridCoordinates = this.getGridCoordinates();
        };
        this.draw = () => {
            this.ctx.beginPath();
            //Write colour based on velocity magnitude square
            // const val = 255*(1-Math.exp(-(this.vx * this.vx + this.vy * this.vy)/100000));
            // this.ctx.fillStyle = `rgb(${val}, 0, ${255- val})`;
            this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            this.ctx.fill();
        };
        this.handleCollision = (other) => {
            if (other === this)
                return;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance_squared = dx * dx + dy * dy;
            if (distance_squared < 4 * this.radius * this.radius + 0) {
                const distance = Math.sqrt(distance_squared);
                const nx = dx / distance;
                const ny = dy / distance;
                const dot_product = nx * (this.vx - other.vx) + ny * (this.vy - other.vy);
                this.vx -= 1 * dot_product * nx * INTERNAL_DAMPING;
                this.vy -= 1 * dot_product * ny * INTERNAL_DAMPING;
                other.vx += 1 * dot_product * nx * INTERNAL_DAMPING;
                other.vy += 1 * dot_product * ny * INTERNAL_DAMPING;
                this.x -= (nx * (2 * this.radius - distance)) / 2;
                this.y -= (ny * (2 * this.radius - distance)) / 2;
                other.x += (nx * (2 * this.radius - distance)) / 2;
                other.y += (ny * (2 * this.radius - distance)) / 2;
            }
        };
        this.getGridCoordinates = () => {
            const x = Math.floor((this.x - ARENA_X_OFFSET) / GRID_SIZE_DL);
            const y = Math.floor((this.y - ARENA_Y_OFFSET) / GRID_SIZE_DL);
            if (x >= GRID_X || y >= GRID_Y || x < 0 || y < 0) {
                console.warn("Out of bounds in grid: " + x, y);
                return { x: 0, y: 0 };
            }
            return { x, y };
        };
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.ax = 0;
        this.ay = 0;
        this.ctx = ctx;
        this.gridCoordinates = this.getGridCoordinates();
        this.ctx.fillStyle = this.color;
    }
}
// Particle handling functions
const addGravity = (particles) => {
    for (let i = 0; i < particles.length; i++) {
        particles[i].ay = GRAVITY;
    }
};
const addParticesToGrid = (particles) => {
    for (let i = 0; i < particles.length; i++) {
        const { x, y } = particles[i].gridCoordinates;
        if (GRID[y][x] === undefined || GRID[y][x] === null) {
            GRID[y][x] = [];
            console.log("Grid cell undefined/null initialized");
        }
        GRID[y][x].push(particles[i]);
    }
};
const handleParicleCollisions = (particles) => {
    for (let i = 0; i < particles.length; i++) {
        const { x, y } = particles[i].gridCoordinates;
        for (let j = -1; j < 2; j++) {
            for (let k = -1; k < 2; k++) {
                if (x + j >= 0 && x + j < GRID_X && y + k >= 0 && y + k < GRID_Y) {
                    for (let l = 0; l < GRID[y + k][x + j].length; l++) {
                        particles[i].handleCollision(GRID[y + k][x + j][l]);
                    }
                }
            }
        }
    }
};
const moveParticles = (particles, dt) => {
    addGravity(particles);
    for (let i = 0; i < particles.length; i++) {
        particles[i].move(dt);
    }
    initializeGrid();
    addParticesToGrid(particles);
    handleParicleCollisions(particles);
};
const drawParticles = (particles) => {
    for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
    }
};
// Core engine
const initiate = () => {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = (SCREEN_WIDTH - ARENA_WIDTH_PIXELS) / 2 +
            Math.random() * ARENA_WIDTH_PIXELS;
        const y = (SCREEN_HEIGHT * (1 - SCREEN_HEIGHT_OCCUPANCY)) / 2 +
            Math.random() * ARENA_HEIGHT_PIXELS;
        const vx = Math.random() * PARTICLE_VELOCITY - PARTICLE_VELOCITY / 2;
        const vy = Math.random() * PARTICLE_VELOCITY - PARTICLE_VELOCITY / 2;
        particles.push(new Particle(x, y, vx, vy, PARTICLE_RADIUS, PARTICLE_COLOR, ctx));
    }
    setInterval(FrameRateUpdater, 200);
    main(particles);
};
const main = (particles) => {
    const new_time = performance.now();
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    for (let i = 0; i < CALC_TO_DISPLAY_RATIO; i++) {
        moveParticles(particles, dt);
    }
    drawParticles(particles);
    timeTaken = new_time - time;
    time = new_time;
    window.requestAnimationFrame(() => main(particles));
};
const FrameRateUpdater = () => {
    info.innerHTML = `Frame rate: ${(1000 / timeTaken).toFixed(2)}FPS`;
};
initiate();
