"use strict";
const LEAF_NODE_MAX_CAPACITY = 4;
const DISPERSE = 30;
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.fillStyle = "white";
    }
}
class QuadTree {
    constructor(x, y, width, height, capacity) {
        this.checkValidPoint = (point) => {
            return (point.x > this.x &&
                point.x <= this.x + this.width &&
                point.y > this.y &&
                point.y <= this.y + this.height);
        };
        this.subDivide = () => {
            this.divided = true;
            this.subTrees.push(new QuadTree(this.x, this.y, this.width / 2, this.height / 2, this.capacity));
            this.subTrees.push(new QuadTree(this.x + this.width / 2, this.y, this.width / 2, this.height / 2, this.capacity));
            this.subTrees.push(new QuadTree(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, this.capacity));
            this.subTrees.push(new QuadTree(this.x, this.y + this.height / 2, this.width / 2, this.height / 2, this.capacity));
            this.points.forEach((point) => {
                this.subTrees.forEach((tree) => {
                    tree.addPoint(point);
                });
            });
            this.points = [];
        };
        this.addPoint = (point) => {
            if (this.checkValidPoint(point) == false) {
                return false;
            }
            this.pointsCount += 1;
            if (this.points.length < this.capacity && !this.divided) {
                this.points.push(point);
                return true;
            }
            else {
                if (!this.divided) {
                    this.points.push(point);
                    this.subDivide();
                    return true;
                }
                else {
                    for (let i = 0; i < this.subTrees.length; i++) {
                        if (this.subTrees[i].addPoint(point)) {
                            return true;
                        }
                    }
                }
                throw new Error("Point not in sub trees");
            }
        };
        this.doesIntersect = (rx1, ry1, rx2, ry2) => {
            let x1 = this.x;
            let x2 = this.x + this.width;
            let y1 = this.y;
            let y2 = this.y + this.height;
            return x2 >= rx1 && x1 <= rx2 && y1 <= ry2 && y2 >= ry1;
        };
        this.queryTree = (rx1, ry1, rx2, ry2) => {
            if (!this.doesIntersect(rx1, ry1, rx2, ry2)) {
                return [];
            }
            let pointsToReturn = [];
            if (!this.divided) {
                this.points.forEach((point) => {
                    if (point.x > rx1 && point.x < rx2 && point.y > ry1 && point.y < ry2) {
                        pointsToReturn.push(point);
                    }
                });
                return pointsToReturn;
            }
            this.subTrees.forEach((subtree) => {
                pointsToReturn.push(...subtree.queryTree(rx1, ry1, rx2, ry2));
            });
            return pointsToReturn;
        };
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.pointsCount = 0;
        this.points = [];
        this.capacity = capacity;
        this.divided = false;
        this.subTrees = [];
    }
}
let canvas = document.getElementById("QuadTreesCanvas");
let ctx = canvas.getContext("2d");
let highlightRect = [0, 0, 0, 0];
let pointsToHighlight = [];
const resizeCanvas = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
};
resizeCanvas();
let myTree = new QuadTree(0, 0, Math.max(canvas.width, canvas.height), Math.max(canvas.width, canvas.height), LEAF_NODE_MAX_CAPACITY);
let points = [];
const drawTree = (tree) => {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.rect(tree.x, tree.y, tree.width, tree.height);
    ctx.stroke();
    if (tree.divided) {
        tree.subTrees.forEach((subTree) => {
            drawTree(subTree);
        });
    }
};
const renderStuff = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTree(myTree);
    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.lineWidth = 1;
    ctx.rect(...highlightRect);
    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 0.4;
    points.forEach((pointCurrent) => {
        ctx.strokeStyle = pointCurrent.fillStyle;
        ctx.fillStyle = pointCurrent.fillStyle;
        ctx.beginPath();
        ctx.arc(pointCurrent.x, pointCurrent.y, 2, 0, 2 * 3.1416);
        ctx.fill();
    });
};
const startTime = performance.now();
const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
};
canvas.addEventListener("mousemove", (event) => {
    // if ((performance.now() - startTime) / 1000 < 4) {
    let { x, y } = getMousePos(canvas, event);
    x += Math.random() * DISPERSE - DISPERSE / 2;
    y += Math.random() * DISPERSE - DISPERSE / 2;
    const point = new Point(x, y);
    points.push(point);
    myTree.addPoint(point);
    // }
    renderStuff();
});
canvas.addEventListener("click", (event) => {
    pointsToHighlight = [];
    const width = 200;
    const height = 100;
    const { x, y } = getMousePos(canvas, event);
    const rectX = x - width / 2;
    const rectY = y - height / 2;
    highlightRect = [rectX, rectY, width, height];
    pointsToHighlight = myTree.queryTree(rectX, rectY, rectX + width, rectY + height);
    pointsToHighlight.forEach((point) => {
        point.fillStyle = "green";
    });
    renderStuff();
});
window.addEventListener("resize", () => {
    resizeCanvas();
    renderStuff();
});
