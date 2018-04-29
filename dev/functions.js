function appendToBody(el, content) {
  if (el === 'text') {
    el = document.createTextNode(content || '');
  }
  else if (typeof el === 'string') {
    el = document.createElement(el);
  }
  document.body.appendChild(el);
}

function imageDataToDataUrl(imageData) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");

  canvas.width = imageData.width;
  canvas.height = imageData.height;

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', .85);
}

function imgToImageData(img) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");

  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function loadScript(path) {
  var scripts = document.getElementsByTagName('script');
  var el;

  for (var i = 0; i < scripts.length; i++) {
    if ((el = scripts.item(i)) && el.getAttribute('src') === path) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  }

  el = document.createElement('script');
  el.setAttribute('type', 'text/javascript');
  el.setAttribute('src', path);
  document.body.appendChild(el);
}
