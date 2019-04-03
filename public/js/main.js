var ImgWarper = ImgWarper || {};

$(document).ready(function(){  
  var canvas = $("#main-canvas")[0];
  var warper = null;

  $('.redraw').change(function () {
    if (warper) {
      warper.redraw();
    }
  });
  var src = 'images/face1.jpg'
  var img = render(src, function (imageData) {
    if (warper) {
      delete warper;
    }
    warper = new ImgWarper.PointDefiner(canvas, img, imageData);
  });
});

var MAX_HEIGHT = 500;
function render(src, callback){
  var image = new Image();
  image.onload = function(){
    var canvas = document.getElementById("myCanvas");
    // if(image.height > MAX_HEIGHT) {
    //   image.width *= MAX_HEIGHT / image.height;
    //   image.height = MAX_HEIGHT;
    // }
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    callback(ctx.getImageData(0, 0, image.width, image.height));
  };
  image.src = src;
  return image;
}
