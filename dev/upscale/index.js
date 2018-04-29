var sourceImg = new Image;
sourceImg.src = "/assets/landscape-tiny.jpg";

sourceImg.addEventListener('load', function(e) {
  var sourceImageData = imgToImageData(this);
  var processedImageData = scaleCropRotate(sourceImageData, 384, 190, true);
  var img = new Image;
  img.src = imageDataToDataUrl(processedImageData);
  appendToBody(img);
});
