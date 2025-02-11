"use strict";
// var ctx: object;
// var canvas: any;
// interface canvasObject{
//     width: number;
//     height: number;
// }
const TIME_STEP = 0.0001;
const ACCURACY_MULTIPLIER = 400;
const VELOCITY_SCALE = 650;
let canvas;
let pathCanvas;
let ctx;
let pathCtx;
let doublePendulum;
let t1but;
let t2but;
let o1but;
let o2but;
let l1but;
let l2but;
let m1but;
let m2but;
let submitBut;
class DoublePendulum {
    constructor(theta1, theta2, omega1, omega2, mass1, mass2, length1, length2, gravity = 9.81, meterToPixel = 100, canvas, ctx, pathCtx) {
        this.meterToPixel = 100;
        this.getAlpha1 = (theta1, omega1, theta2, omega2) => {
            return ((-this.gravity * (2 * this.mass1 + this.mass2) * Math.sin(theta1) -
                this.mass2 * this.gravity * Math.sin(theta1 - 2 * theta2) -
                2 *
                    Math.sin(theta1 - theta2) *
                    this.mass2 *
                    (Math.pow(omega2, 2) * this.length2 +
                        Math.pow(omega1, 2) * this.length1 * Math.cos(theta1 - theta2))) /
                (this.length1 *
                    (2 * this.mass1 +
                        this.mass2 -
                        this.mass2 * Math.cos(2 * theta1 - 2 * theta2))));
        };
        this.getAlpha2 = (theta1, omega1, theta2, omega2) => {
            return ((2 *
                Math.sin(theta1 - theta2) *
                (Math.pow(omega1, 2) * this.length1 * (this.mass1 + this.mass2) +
                    this.gravity * (this.mass1 + this.mass2) * Math.cos(theta1) +
                    Math.pow(omega2, 2) *
                        this.length2 *
                        this.mass2 *
                        Math.cos(theta1 - theta2))) /
                (this.length2 *
                    (2 * this.mass1 +
                        this.mass2 -
                        this.mass2 * Math.cos(2 * theta1 - 2 * theta2))));
        };
        this.incrementOmega1 = (dt) => {
            this.omega1 += this.alpha1 * dt;
            this.omega2 += this.alpha2 * dt;
        };
        this.incrementTheta1 = (dt) => {
            this.theta1 += this.omega1 * dt;
            this.theta2 += this.omega2 * dt;
        };
        this.rungeKutta = (dt) => {
            let k1 = this.getAlpha1(this.theta1, this.omega1, this.theta2, this.omega2) * dt;
            let l1 = this.getAlpha2(this.theta1, this.omega1, this.theta2, this.omega2) * dt;
            let k2 = this.getAlpha1(this.theta1 + this.omega1 * dt, this.omega1 + k1, this.theta2 + this.omega2 * dt, this.omega2 + l1) * dt;
            let l2 = this.getAlpha2(this.theta1 + this.omega1 * dt, this.omega1 + k1, this.theta2 + this.omega2 * dt, this.omega2 + l1) * dt;
            this.theta1 += this.omega1 * dt * 0.5;
            this.theta2 += this.omega2 * dt * 0.5;
            this.omega1 += (k1 + k2) / 2;
            this.omega2 += (l1 + l2) / 2;
            this.theta1 += this.omega1 * dt * 0.5;
            this.theta2 += this.omega2 * dt * 0.5;
        };
        this.initPath = () => {
            let y1 = this.meterToPixel * this.length1 * Math.cos(this.theta1);
            let x1 = this.meterToPixel * this.length1 * Math.sin(this.theta1);
            let x2 = x1 + this.meterToPixel * this.length2 * Math.sin(this.theta2);
            let y2 = y1 + this.meterToPixel * this.length2 * Math.cos(this.theta2);
            this.pathCtx.beginPath();
            this.pathCtx.moveTo(this.canvas.width / 2 + x2, this.canvas.height / 2 + y2);
        };
        this.displayPendulum = () => {
            // console.log("Drawing self - Pendulum")
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            let y1 = this.meterToPixel * this.length1 * Math.cos(this.theta1);
            let x1 = this.meterToPixel * this.length1 * Math.sin(this.theta1);
            let x2 = x1 + this.meterToPixel * this.length2 * Math.sin(this.theta2);
            let y2 = y1 + this.meterToPixel * this.length2 * Math.cos(this.theta2);
            this.ctx.beginPath();
            this.pathCtx.beginPath();
            this.pathCtx.moveTo(this.canvas.width / 2 + this.previousX, this.canvas.height / 4 + this.previousY);
            this.ctx.moveTo(this.canvas.width / 2, this.canvas.height / 4);
            this.ctx.lineTo(this.canvas.width / 2 + x1, this.canvas.height / 4 + y1);
            this.ctx.lineTo(this.canvas.width / 2 + x2, this.canvas.height / 4 + y2);
            this.pathCtx.lineTo(this.canvas.width / 2 + x2, this.canvas.height / 4 + y2);
            let vel = Math.exp(-Math.sqrt((this.previousX - x2) ** 2 + (this.previousY - y2) ** 2) /
                (TIME_STEP * VELOCITY_SCALE * ACCURACY_MULTIPLIER));
            this.pathCtx.strokeStyle = `rgb(${255 * (1 - vel)},0, ${255 * vel})`;
            this.pathCtx.stroke();
            console.log(255 * vel);
            this.ctx.stroke();
            this.previousX = x2;
            this.previousY = y2;
        };
        this.getAllResizeValues = () => {
            return [
                this.theta1,
                this.theta2,
                this.omega1,
                this.omega2,
                this.mass1,
                this.mass2,
                this.length1,
                this.length2,
                this.gravity,
                this.meterToPixel,
                this.canvas,
                this.ctx,
                this.pathCtx,
            ];
        };
        // console.log("Double Pendulum created");
        this.theta1 = theta1;
        this.theta2 = theta2;
        this.omega1 = omega1;
        this.omega2 = omega2;
        this.mass1 = mass1;
        this.mass2 = mass2;
        this.length1 = length1;
        this.length2 = length2;
        this.gravity = gravity;
        this.alpha1 = this.getAlpha1(this.theta1, this.omega1, this.theta2, this.omega2);
        this.alpha2 = this.getAlpha2(this.theta1, this.omega1, this.theta2, this.omega2);
        this.canvas = canvas;
        this.ctx = ctx;
        this.pathCtx = pathCtx;
        this.meterToPixel = meterToPixel;
        this.ctx.strokeStyle = "white";
        this.pathCtx.strokeStyle = "red";
        let y1 = this.meterToPixel * this.length1 * Math.cos(this.theta1);
        let x1 = this.meterToPixel * this.length1 * Math.sin(this.theta1);
        let x2 = x1 + this.meterToPixel * this.length2 * Math.sin(this.theta2);
        let y2 = y1 + this.meterToPixel * this.length2 * Math.cos(this.theta2);
        this.previousX = x2;
        this.previousY = y2;
        // this.pathCtx.moveTo(x2, y2);
    }
}
// const displayPendulum = (displayInformation: number[]): void => {
// }
const angleToRadians = (angle) => {
    return (angle * Math.PI) / 180;
};
const resizeHandle = (canvas) => {
    // console.log('Resizing');
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    pathCanvas.width = window.innerWidth * devicePixelRatio;
    pathCanvas.height = window.innerHeight * devicePixelRatio;
    pathCanvas.style.width = window.innerWidth + "px";
    pathCanvas.style.height = window.innerHeight + "px";
    doublePendulum = new DoublePendulum(...doublePendulum.getAllResizeValues());
    // console.log(new DoublePendulum(...doublePendulum.getAllResizeValues(), canvas, ctx))
};
const newValuesHandler = () => {
    let theta1 = parseFloat(t1but.value);
    let theta2 = parseFloat(t2but.value);
    let omega1 = parseFloat(o1but.value);
    let omega2 = parseFloat(o2but.value);
    let length1 = parseFloat(l1but.value);
    let length2 = parseFloat(l2but.value);
    let mass1 = parseFloat(m1but.value);
    let mass2 = parseFloat(m2but.value);
    console.log(theta1, theta2, omega1, omega2);
    doublePendulum = new DoublePendulum(angleToRadians(theta1), angleToRadians(theta2), omega1, omega2, mass1, mass2, length1, length2, 9.81, 100, canvas, ctx, pathCtx);
    console.log("New values set");
    resizeHandle(canvas);
};
const init = () => {
    canvas = document.getElementById("DoublePendulumCanvas");
    pathCanvas = document.getElementById("DoublePendulumPathCanvas");
    ctx = canvas.getContext("2d");
    pathCtx = pathCanvas.getContext("2d");
    pathCtx.lineWidth = 1;
    pathCtx.scale(devicePixelRatio, devicePixelRatio);
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    pathCanvas.width = window.innerWidth * devicePixelRatio;
    pathCanvas.height = window.innerHeight * devicePixelRatio;
    pathCanvas.style.width = window.innerWidth + "px";
    pathCanvas.style.height = window.innerHeight + "px";
    t1but = document.getElementById("theta1");
    t2but = document.getElementById("theta2");
    o1but = document.getElementById("omega1");
    o2but = document.getElementById("omega2");
    l1but = document.getElementById("length1");
    l2but = document.getElementById("length2");
    m1but = document.getElementById("mass1");
    m2but = document.getElementById("mass2");
    submitBut = document.getElementById("Submit");
    if (!t1but || !t2but || !o1but || !o2but || !submitBut || !l1but || !l2but || !m1but || !m2but) {
        throw new Error("One of the input elements is missing");
    }
    console.log("Done. Init complete");
    doublePendulum = new DoublePendulum(angleToRadians(60), angleToRadians(120), 1, 0, 1, 1, 1.5, 1, 9.81, 100, canvas, ctx, pathCtx);
    setInterval(() => {
        main(doublePendulum);
    }, 20);
    window.addEventListener("resize", () => {
        resizeHandle(canvas);
    });
    submitBut.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Submitted");
        newValuesHandler();
    });
};
const main = (doublePendulum) => {
    for (let i = 0; i < ACCURACY_MULTIPLIER; i++) {
        doublePendulum.rungeKutta(TIME_STEP);
    }
    // doublePendulum.incrementTheta1(TIME_STEP);
    doublePendulum.displayPendulum();
};
window.addEventListener("DOMContentLoaded", init);
