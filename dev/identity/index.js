var sourceImg = new Image;
sourceImg.src = "/assets/landscape-thumb.jpg";

sourceImg.addEventListener('load', function(e) {
  var sourceImageData = imgToImageData(this);
  var processedImageData = scaleCropRotate(sourceImageData, true);
  var img = new Image;
  img.src = imageDataToDataUrl(processedImageData);
  appendToBody(img);
});
