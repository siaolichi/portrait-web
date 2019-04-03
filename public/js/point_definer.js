/* eslint-disable no-undef */
var ImgWarper = ImgWarper || {};

ImgWarper.PointDefiner = function(canvas, image, imgData) {
  this.oriPoints = new Array();
  this.dstPoints = new Array();

  //set up points for change;
  let c = canvas;
  this.canvas = canvas;
  this.direction = 1;
  this.dragging_ = false;
  this.computing_ = false;
  this.currentPointIndex = 0;
  this.imgWarper = new ImgWarper.Warper(c, image, imgData);
  this.addPoints();
  this.animate();
};
ImgWarper.PointDefiner.prototype.animate = function() {
  setTimeout(() => {
    this.dragging_ = true;
    this.computing_ = true;
    this.currentPointIndex += this.direction;
    // console.log(this.currentPointIndex);
    let endX = this.dstPoints[this.currentPointIndex].x + 0.5;
    let endY = this.dstPoints[this.currentPointIndex].y + 0.5;
    // console.log(endX, endY)
    let movedPoint = new ImgWarper.Point(endX, endY);
    this.dstPoints[this.currentPointIndex] = movedPoint;
    this.computing_ = false;
    this.dragging_ = false;
    this.imgWarper.warp(this.oriPoints, this.dstPoints);
    if (document.getElementById("show-control").checked) {
      this.redrawCanvas();
    }
    if (
      this.currentPointIndex >= this.dstPoints.length - 1 ||
      this.currentPointIndex <= 0
    ) {
      this.direction *= -1;
    }
    window.requestAnimationFrame(this.animate.bind(this));
  }, 30);
};
ImgWarper.PointDefiner.prototype.addPoints = function() {
  let vm = this;
  $.getJSON("../images/positions.json", function(positions) {
    positions.forEach(el => {
      let q = new ImgWarper.Point(el.x, el.y);
      vm.oriPoints.push(q);
      vm.dstPoints.push(q);
    });
  });
};
ImgWarper.PointDefiner.prototype.redrawCanvas = function() {
  let ctx = this.canvas.getContext("2d");
  for (let i = 0; i < this.oriPoints.length; i++) {
    if (i < this.dstPoints.length) {
      if (i == this.currentPointIndex) {
        this.drawOnePoint(this.dstPoints[i], ctx, "orange");
      } else {
        this.drawOnePoint(this.dstPoints[i], ctx, "#6373CF");
      }

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.moveTo(this.oriPoints[i].x, this.oriPoints[i].y);
      ctx.lineTo(this.dstPoints[i].x, this.dstPoints[i].y);
      //ctx.strokeStyle = '#691C50';
      ctx.stroke();
    } else {
      this.drawOnePoint(this.oriPoints[i], ctx, "#119a21");
    }
  }
  ctx.stroke();
};

ImgWarper.PointDefiner.prototype.drawOnePoint = function(point, ctx, color) {
  let radius = 10;
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.arc(parseInt(point.x), parseInt(point.y), radius, 0, 2 * Math.PI, false);
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.arc(parseInt(point.x), parseInt(point.y), 3, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
};
