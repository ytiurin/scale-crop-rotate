scaleCropRotate.URLToImageData("/assets/landscape-thumb.jpg")
.then(function(data) {
  return scaleCropRotate(data, true);
})
.then(function(data) {
  var image = new Image;
  image.src = scaleCropRotate.imageDataToDataURL(data);
  document.body.append(image);
});
