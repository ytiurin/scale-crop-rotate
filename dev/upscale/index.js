scaleCropRotate.URLToImageData("/assets/landscape-tiny.jpg")
.then(function(data) {
  return scaleCropRotate(data, 384, 190, true);
})
.then(function(data) {
  var image = new Image;
  image.src = scaleCropRotate.imageDataToDataURL(data);
  document.body.append(image);
});
