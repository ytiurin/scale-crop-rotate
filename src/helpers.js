function blobToImageData(blob) {
  var imageLoaded, fileReadError;

  function fileRead() {
    var image = new Image;
    image.addEventListener('error', fileReadError);
    image.addEventListener('load', imageLoaded);
    image.src = this.result;
  }

  function initPromise(resolve, reject) {
    imageLoaded = createImageLoadedResolver(resolve);
    fileReadError = createFileReadRejector(reject, blob);

    var reader = new FileReader;
    reader.addEventListener("error", fileReadError);
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

function createFileReadRejector(reject, blob) {
  return function fileReadError() {
    this.removeEventListener('error', fileReadError);
    reject(new Error('Could not read image from file ' + blob.name));
  }
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

function createImageLoadRejector(reject, isReadFromFile) {
  return function imageLoadError() {
    this.removeEventListener('error', imageLoadError);
    reject(new URIError('Could not load image by the URI ' + this.src));
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
    var imageLoadError = createImageLoadRejector(reject);

    if (image.complete) {
      imageLoaded.bind(image)();
    }
    else {
      image.addEventListener("error", imageLoadError);
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
