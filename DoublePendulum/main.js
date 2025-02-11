// var ctx: object;
// var canvas: any;
// interface canvasObject{
//     width: number;
//     height: number;
// }
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var TIME_STEP = 0.0001;
var ACCURACY_MULTIPLIER = 400;
var VELOCITY_SCALE = 650;
var canvas;
var pathCanvas;
var ctx;
var pathCtx;
var doublePendulum;
var t1but;
var t2but;
var o1but;
var o2but;
var l1but;
var l2but;
var m1but;
var m2but;
var submitBut;
var DoublePendulum = /** @class */ (function () {
    function DoublePendulum(theta1, theta2, omega1, omega2, mass1, mass2, length1, length2, gravity, meterToPixel, canvas, ctx, pathCtx) {
        if (gravity === void 0) { gravity = 9.81; }
        if (meterToPixel === void 0) { meterToPixel = 100; }
        var _this = this;
        this.meterToPixel = 100;
        this.getAlpha1 = function (theta1, omega1, theta2, omega2) {
            return ((-_this.gravity * (2 * _this.mass1 + _this.mass2) * Math.sin(theta1) -
                _this.mass2 * _this.gravity * Math.sin(theta1 - 2 * theta2) -
                2 *
                    Math.sin(theta1 - theta2) *
                    _this.mass2 *
                    (Math.pow(omega2, 2) * _this.length2 +
                        Math.pow(omega1, 2) * _this.length1 * Math.cos(theta1 - theta2))) /
                (_this.length1 *
                    (2 * _this.mass1 +
                        _this.mass2 -
                        _this.mass2 * Math.cos(2 * theta1 - 2 * theta2))));
        };
        this.getAlpha2 = function (theta1, omega1, theta2, omega2) {
            return ((2 *
                Math.sin(theta1 - theta2) *
                (Math.pow(omega1, 2) * _this.length1 * (_this.mass1 + _this.mass2) +
                    _this.gravity * (_this.mass1 + _this.mass2) * Math.cos(theta1) +
                    Math.pow(omega2, 2) *
                        _this.length2 *
                        _this.mass2 *
                        Math.cos(theta1 - theta2))) /
                (_this.length2 *
                    (2 * _this.mass1 +
                        _this.mass2 -
                        _this.mass2 * Math.cos(2 * theta1 - 2 * theta2))));
        };
        this.incrementOmega1 = function (dt) {
            _this.omega1 += _this.alpha1 * dt;
            _this.omega2 += _this.alpha2 * dt;
        };
        this.incrementTheta1 = function (dt) {
            _this.theta1 += _this.omega1 * dt;
            _this.theta2 += _this.omega2 * dt;
        };
        this.rungeKutta = function (dt) {
            var k1 = _this.getAlpha1(_this.theta1, _this.omega1, _this.theta2, _this.omega2) * dt;
            var l1 = _this.getAlpha2(_this.theta1, _this.omega1, _this.theta2, _this.omega2) * dt;
            var k2 = _this.getAlpha1(_this.theta1 + _this.omega1 * dt, _this.omega1 + k1, _this.theta2 + _this.omega2 * dt, _this.omega2 + l1) * dt;
            var l2 = _this.getAlpha2(_this.theta1 + _this.omega1 * dt, _this.omega1 + k1, _this.theta2 + _this.omega2 * dt, _this.omega2 + l1) * dt;
            _this.theta1 += _this.omega1 * dt * 0.5;
            _this.theta2 += _this.omega2 * dt * 0.5;
            _this.omega1 += (k1 + k2) / 2;
            _this.omega2 += (l1 + l2) / 2;
            _this.theta1 += _this.omega1 * dt * 0.5;
            _this.theta2 += _this.omega2 * dt * 0.5;
        };
        this.initPath = function () {
            var y1 = _this.meterToPixel * _this.length1 * Math.cos(_this.theta1);
            var x1 = _this.meterToPixel * _this.length1 * Math.sin(_this.theta1);
            var x2 = x1 + _this.meterToPixel * _this.length2 * Math.sin(_this.theta2);
            var y2 = y1 + _this.meterToPixel * _this.length2 * Math.cos(_this.theta2);
            _this.pathCtx.beginPath();
            _this.pathCtx.moveTo(_this.canvas.width / 2 + x2, _this.canvas.height / 2 + y2);
        };
        this.displayPendulum = function () {
            // console.log("Drawing self - Pendulum")
            _this.ctx.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
            var y1 = _this.meterToPixel * _this.length1 * Math.cos(_this.theta1);
            var x1 = _this.meterToPixel * _this.length1 * Math.sin(_this.theta1);
            var x2 = x1 + _this.meterToPixel * _this.length2 * Math.sin(_this.theta2);
            var y2 = y1 + _this.meterToPixel * _this.length2 * Math.cos(_this.theta2);
            _this.ctx.beginPath();
            _this.pathCtx.beginPath();
            _this.pathCtx.moveTo(_this.canvas.width / 2 + _this.previousX, _this.canvas.height / 2 + _this.previousY);
            _this.ctx.moveTo(_this.canvas.width / 2, _this.canvas.height / 2);
            _this.ctx.lineTo(_this.canvas.width / 2 + x1, _this.canvas.height / 2 + y1);
            _this.ctx.lineTo(_this.canvas.width / 2 + x2, _this.canvas.height / 2 + y2);
            _this.pathCtx.lineTo(_this.canvas.width / 2 + x2, _this.canvas.height / 2 + y2);
            var vel = Math.exp(-Math.sqrt(Math.pow((_this.previousX - x2), 2) + Math.pow((_this.previousY - y2), 2)) /
                (TIME_STEP * VELOCITY_SCALE * ACCURACY_MULTIPLIER));
            _this.pathCtx.strokeStyle = "rgb(".concat(255 * (1 - vel), ",0, ").concat(255 * vel, ")");
            _this.pathCtx.stroke();
            console.log(255 * vel);
            _this.ctx.stroke();
            _this.previousX = x2;
            _this.previousY = y2;
        };
        this.getAllResizeValues = function () {
            return [
                _this.theta1,
                _this.theta2,
                _this.omega1,
                _this.omega2,
                _this.mass1,
                _this.mass2,
                _this.length1,
                _this.length2,
                _this.gravity,
                _this.meterToPixel,
                _this.canvas,
                _this.ctx,
                _this.pathCtx,
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
        var y1 = this.meterToPixel * this.length1 * Math.cos(this.theta1);
        var x1 = this.meterToPixel * this.length1 * Math.sin(this.theta1);
        var x2 = x1 + this.meterToPixel * this.length2 * Math.sin(this.theta2);
        var y2 = y1 + this.meterToPixel * this.length2 * Math.cos(this.theta2);
        this.previousX = x2;
        this.previousY = y2;
        // this.pathCtx.moveTo(x2, y2);
    }
    return DoublePendulum;
}());
// const displayPendulum = (displayInformation: number[]): void => {
// }
var angleToRadians = function (angle) {
    return (angle * Math.PI) / 180;
};
var resizeHandle = function (canvas) {
    // console.log('Resizing');
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    pathCanvas.width = window.innerWidth * devicePixelRatio;
    pathCanvas.height = window.innerHeight * devicePixelRatio;
    pathCanvas.style.width = window.innerWidth + "px";
    pathCanvas.style.height = window.innerHeight + "px";
    doublePendulum = new (DoublePendulum.bind.apply(DoublePendulum, __spreadArray([void 0], doublePendulum.getAllResizeValues(), false)))();
    // console.log(new DoublePendulum(...doublePendulum.getAllResizeValues(), canvas, ctx))
};
var newValuesHandler = function () {
    var theta1 = parseFloat(t1but.value);
    var theta2 = parseFloat(t2but.value);
    var omega1 = parseFloat(o1but.value);
    var omega2 = parseFloat(o2but.value);
    var length1 = parseFloat(l1but.value);
    var length2 = parseFloat(l2but.value);
    var mass1 = parseFloat(m1but.value);
    var mass2 = parseFloat(m2but.value);
    console.log(theta1, theta2, omega1, omega2);
    doublePendulum = new DoublePendulum(angleToRadians(theta1), angleToRadians(theta2), omega1, omega2, mass1, mass2, length1, length2, 9.81, 100, canvas, ctx, pathCtx);
    console.log("New values set");
    resizeHandle(canvas);
};
var init = function () {
    canvas = document.getElementById("DoublePendulumCanvas");
    pathCanvas = document.getElementById("DoublePendulumPathCanvas");
    ctx = canvas.getContext("2d");
    pathCtx = pathCanvas.getContext("2d");
    pathCtx.strokeWidth = 1;
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
    setInterval(function () {
        main(doublePendulum);
    }, 20);
    window.addEventListener("resize", function () {
        resizeHandle(canvas);
    });
    submitBut.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Submitted");
        newValuesHandler();
    });
};
var main = function (doublePendulum) {
    for (var i = 0; i < ACCURACY_MULTIPLIER; i++) {
        doublePendulum.rungeKutta(TIME_STEP);
    }
    // doublePendulum.incrementTheta1(TIME_STEP);
    doublePendulum.displayPendulum();
};
window.addEventListener("DOMContentLoaded", init);
