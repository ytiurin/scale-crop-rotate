var sourceImg = new Image;
sourceImg.src = "/assets/landscape.jpg";

sourceImg.addEventListener('load', function(e) {
  var sourceData = imgToImageData(this);

  setTimeout(function() {
    var progress = document.getElementsByTagName('progress')[0];
    var checkmark = document.getElementById('checkmark');
    var start = new Date;

    scaleCropRotate(sourceData, 384, 190)
    .progress(function(value) {
      progress.value = value;
    })
    .then(function(imageData) {
      console.log(new Date - start);
      var img = new Image;
      img.src = imageDataToDataUrl(imageData);
      document.body.appendChild(img);
      checkmark.style.display = 'inline';
    });
  }, 1000);
});


// SPINNER
function nextSpin() {
  deg = ++deg > 360 ? 0 : deg;
  spinner.style.transform = `rotate3d(0,0,1,${deg}deg)`
  requestAnimationFrame(nextSpin);
}
var spinner = document.getElementById('spinner');
var deg = 0;
nextSpin();
