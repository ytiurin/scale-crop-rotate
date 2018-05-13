setTimeout(function() {
  var progress = document.getElementsByTagName('progress')[0];
  var checkmark = document.getElementById('checkmark');
  var start = new Date;

  scaleCropRotate.URLToImageData("/assets/landscape.jpg")
  .then(function(data) {
    return scaleCropRotate(data, 384, 190)
    .progress(function(value) {
      progress.value = value;
    })
  })
  .then(function(data) {
    console.log(new Date - start);
    var img = new Image;
    img.src = scaleCropRotate.imageDataToDataURL(data);
    document.body.appendChild(img);
    checkmark.style.display = 'inline';
  });
}, 1000);
