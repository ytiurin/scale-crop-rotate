function blobToImageData(blob) {
  var imageLoaded;

  function fileRead() {
    var image = new Image;
    image.addEventListener('load', imageLoaded);
    image.src = this.result;
  }

  function initPromise(resolve, reject) {
    imageLoaded = createImageLoadedResolver(resolve);

    var reader = new FileReader;
    reader.addEventListener("load", fileRead);
    reader.readAsDataURL(blob);
  }
  return new Promise(initPromise);
}

function createCanvasWithImageData(data) {
  var canvas = document.createElement('canvas');

  canvas.width  = data.width;
  canvas.height = data.height ;

  var ctx = canvas.getContext("2d");
  ctx.putImageData(data, 0, 0);

  return canvas;
}

function createImageLoadedResolver(resolve) {
  return function imageLoaded() {
    this.removeEventListener('load', imageLoaded);
    var canvas = document.createElement('canvas');

    canvas.width  = this.naturalWidth;
    canvas.height = this.naturalHeight;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);

    var data = ctx.getImageData(0, 0, this.naturalWidth, this.naturalHeight);
    resolve(data);
  }
}

function imageDataToBlob(data, imageType, quality) {
  function initPromise(resolve, reject) {
    var canvas = createCanvasWithImageData(data);
    canvas.toBlob(resolve, "image/" + (imageType || "jpeg"), quality || .85);
  }
  return new Promise(initPromise);
}

function imageDataToDataURL(data, imageType, quality) {
  var canvas = createCanvasWithImageData(data);
  return canvas.toDataURL("image/" + (imageType || "jpeg"), quality || .85);
}

function imageToImageData(image) {
  function initPromise(resolve, reject) {
    var imageLoaded = createImageLoadedResolver(resolve);

    if (image.complete) {
      imageLoaded.bind(image)();
    }
    else {
      image.addEventListener("load", imageLoaded);
    }
  }
  return new Promise(initPromise);
}

function URLToImageData(url) {
  var image = new Image;
  image.src = url;
  return imageToImageData(image);
}

scaleCropRotate.blobToImageData    = blobToImageData;
scaleCropRotate.imageDataToBlob    = imageDataToBlob;
scaleCropRotate.imageDataToDataURL = imageDataToDataURL;
scaleCropRotate.imageToImageData   = imageToImageData;
scaleCropRotate.URLToImageData     = URLToImageData;
