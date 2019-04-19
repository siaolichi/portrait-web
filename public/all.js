let vid_width = 300;
let vid_height = 300;
let canvas, ctx, vidCanvas, vidCtx, overlay, overlayCC, result, resultCC;
let ctrack = new clm.tracker();
let myCamvas = undefined;
let circleCenter = { x: 10, y: 10 };
let circleRadial = 200;
let angleRadians = 0;
let trackingStarted = false;
let imgWarper = {};
let oriPoints = [];
let dstPoints = [];
let currentIndex = 0;
let currentPoint = [];
let moveUnit = [];
let fps = 25;
let now, then, elapsed;
let newPos = [];
let readyToChange = true;
let currentRadians = 1;

$(document).ready(() => {
    overlay = document.getElementById("overlay");
    overlayCC = overlay.getContext("2d");
    result = document.getElementById("result");
    resultCC = result.getContext("2d");
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    let src = "./images/face1.jpg";
    render(canvas, src);
    if (imgWarper) {
        imgWarper = {};
    }

    then = Date.now();
    fpsInterval = 1000 / fps;

    vidCanvas = document.getElementById("c1");
    vidCtx = vidCanvas.getContext("2d");
    ctrack.init();
    myCamvas = new camvas(vidCtx, drawVideo);

    let scaleVal = $(".container").innerWidth() / myCamvas.video.width;
    vid_width = $(".container").innerWidth();
    vid_height = myCamvas.video.height * scaleVal;
    vidCanvas.width = vid_width;
    vidCanvas.height = vid_height;
    overlay.width = vid_width;
    overlay.height = vid_height;
    result.width = $(document).innerWidth();
    result.height = $(document).innerHeight();

    ctrack.start(vidCanvas);
});
const getRandomInt = (min, max) => {
    let result;
    if (min < 0) {
        result = Math.floor(Math.random() * Math.floor(max - min) + min);
    } else {
        result = Math.floor(Math.random() * Math.floor(min + max) - min);
    }
    console.log(result);
    return result;
};
const dist = (p1, p2) => {
    let a = p2.x - p1.x;
    let b = p2.y - p1.y;
    return Math.sqrt(a * a + b * b);
};
const getUnit = (p1, p2) => {
    let newDist = dist(p1, p2);
    let x = (p2.x - p1.x) / newDist;
    let y = (p2.y - p1.y) / newDist;
    // console.log(x, y);
    return { x, y };
};
const changeIndex = () => {
    if (currentIndex < dstPoints.length - 1) currentIndex += 1;
    else currentIndex = 0;
};
const addPoints = () => {
    console.log(imgWarper);
    $.getJSON("./images/positions.json", function(positions) {
        positions.forEach((el, index) => {
            console.log(el);
            let q = new ImgWarper.Point(el.x, el.y);
            let q2 = new ImgWarper.Point(
                el.x + getRandomInt(-30, 30),
                el.y + getRandomInt(-30, 30)
            );
            oriPoints.push(q);
            dstPoints.push(q2);
            currentPoint.push(q);
            moveUnit.push(getUnit(oriPoints[index], dstPoints[index]));
        });
        staticPos = [
            { x: 50, y: 50 },
            { x: 50, y: 1200 },
            { x: 750, y: 50 },
            { x: 750, y: 1200 },
            { x: 150, y: 100 },
            { x: 150, y: 325 },
            { x: 150, y: 550 },
            { x: 350, y: 550 },
            { x: 350, y: 100 },
            { x: 550, y: 100 },
            { x: 550, y: 350 },
            { x: 550, y: 550 }
        ];
        staticPos.forEach(el => {
            let q = new ImgWarper.Point(el.x, el.y);
            oriPoints.push(q);
            dstPoints.push(q);
            currentPoint.push(q);
            moveUnit.push(0);
        });
    });
};
const animate = () => {
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        if (readyToChange === true) {
            newPos.forEach((el, index) => {
                if (el) {
                    let q = new ImgWarper.Point(el.x, el.y);
                    dstPoints[index] = q;
                    moveUnit[index] = getUnit(
                        currentPoint[index],
                        dstPoints[index]
                    );
                }
            });
        }
        camLoop();
        readyToChange = true;
        dstPoints.forEach((value, index) => {
            if (dist(currentPoint[index], dstPoints[index]) > 1) {
                let movedPoint = new ImgWarper.Point(
                    currentPoint[index].x + moveUnit[index].x,
                    currentPoint[index].y + moveUnit[index].y
                );
                currentPoint[index] = movedPoint;
                readyToChange = false;
            }
        });
        imgWarper.warp(oriPoints, currentPoint);

        resultCC.save();
        resultCC.translate(result.width+3, -3);
        resultCC.scale(
            (result.width+10) / canvas.height,
            (result.width+10) / canvas.height
        );
        resultCC.rotate(Math.PI / 2);
        // resultCC.translate(result.width / 2, 0);
        resultCC.drawImage(canvas, 0, 0);
        resultCC.restore();
        this.redrawCanvas();
        window.requestAnimationFrame(animate);
    }
};
const render = (canvas, src) => {
    let image = new Image();
    image.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        let imageData = ctx.getImageData(0, 0, image.width, image.height);
        ctx.clearRect(0, 0, image.width, image.height);
        imgWarper = new ImgWarper.Warper(canvas, imageData);
        addPoints();
        animate();
    };
    image.crossOrigin = "";
    image.src = src;
};
const drawVideo = video => {
    vidCtx.clearRect(0, 0, vid_width, vid_height);
    if (this.currentRadians != this.angleRadians) {
        this.ctx1.rotate(-this.angleRadians);
        this.currentRadians = this.angleRadians;
    }
    vidCtx.save();
    vidCtx.translate(vid_width / 2, vid_height / 2);
    if (this.currentRadians != this.angleRadians) {
        this.ctx1.rotate(-this.angleRadians);
        this.currentRadians = this.angleRadians;
    }
    vidCtx.drawImage(
        video,
        -vid_width / 2,
        -vid_height / 2,
        vid_width,
        vid_height
    );
    vidCtx.restore();
};
const camLoop = () => {
    var positions = ctrack.getCurrentPosition();
    if (positions) {
        oriLeftEye = { x: 415, y: 305 };
        oriRightEye = { x: 314, y: 307 };
        let oriDis = Math.sqrt(
            (oriLeftEye.x - oriRightEye.x) ** 2 +
                (oriLeftEye.y - oriRightEye.y) ** 2
        );
        newLeftEye = { x: positions[32][0], y: positions[32][1] };
        newRightEye = { x: positions[27][0], y: positions[27][1] };
        let newDis = Math.sqrt(
            (newLeftEye.x - newRightEye.x) ** 2 +
                (newLeftEye.y - newRightEye.y) ** 2
        );
        let positionScale = oriDis / newDis;
        // overlayCC.clearRect(0, 0, vid_width, vid_height);
        // ctrack.draw(overlay);
        newPos = [];
        let oriPos = { x: 478, y: 320 };
        let trans = {
            x: oriPos.x - positions[13][0] * positionScale,
            y: oriPos.y - positions[13][1] * positionScale
        };
        console.log(trans);
        for (var p = 0; p < positions.length - 1; p += 4) {
            newPos.push({
                x: parseInt(positions[p][0] * positionScale + trans.x),
                y: parseInt(positions[p][1] * positionScale + trans.y)
            });
        }
        angleRadians = Math.atan2(
            newLeftEye.y - newRightEye.y,
            newLeftEye.x - newRightEye.x
        );
    }
    myCamvas.loop();
};
redrawCanvas = function(points) {
    let ctx = canvas.getContext("2d");
    for (let i = 0; i < currentPoint.length; i++) {
        if (i < dstPoints.length) {
            drawOnePoint(dstPoints[i], ctx, "#6373CF");

            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.moveTo(currentPoint[i].x, currentPoint[i].y);
            ctx.lineTo(dstPoints[i].x, dstPoints[i].y);
            //ctx.strokeStyle = '#691C50';
            ctx.stroke();
        } else {
            drawOnePoint(currentPoint[i], ctx, "#119a21");
        }
    }
    ctx.stroke();
};

drawOnePoint = function(point, ctx, color) {
    let radius = 10;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.arc(
        parseInt(point.x),
        parseInt(point.y),
        radius,
        0,
        2 * Math.PI,
        false
    );
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.arc(parseInt(point.x), parseInt(point.y), 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
};
