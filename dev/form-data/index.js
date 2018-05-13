var formData = new FormData;
var button = document.getElementsByTagName("button")[0];
var URL = window.URL || window.webkitURL;

function Queue(userQueue)
{
  var n=0
  this.continue = function() {
    return this[0] && this.shift()().then(this.continue) || Promise.resolve();
  }.bind(this);

  userQueue && this.splice.apply(this, [0, 0].concat(userQueue));
}
Queue.prototype = Array.prototype;

function submitForm()
{
  var request = new XMLHttpRequest;
  request.open("POST", "http://foo.com/submitform.php");
  request.send(formData);
}

function filesChanged(files)
{
  var filesArray = Array.prototype.slice.call(files);

  var queue = filesArray.map(function(file) {
    return function() {
      return scaleCropRotate.blobToImageData(file)
      .then(function(data) {
        return scaleCropRotate(data, 400, 400);
      })
      .then(function(data) {
        return scaleCropRotate.imageDataToBlob(data);
      })
      .then(function(blob) {
        formData.append("userpic[]", blob, file.name);
        // Preview image
        var destImg = document.createElement("img");
        destImg.src = URL.createObjectURL(blob);
        document.getElementById("previews").appendChild(destImg);
      });
    };
  });

  queue = new Queue(queue);
  queue.continue()
  .then(function() {
    button.disabled = false;
  });
}

button.disabled = true;
