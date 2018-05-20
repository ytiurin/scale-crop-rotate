Scale, crop and rotate images, not blocking UI. :construction::collision:
==========================================================================
```javascript
import scaleCropRotate, { imageDataToDataURL, URLToImageData } from 'scale-crop-rotate';

const progress = document.getElementsByTagName('progress')[0];

const resizeImage = async (imageURL, width, height) => {
  const data = await URLToImageData(imageURL);

  try {
    const data = await scaleCropRotate(data, width, height)
      .progress(value => {
        progress.value = value;
      });

    image.src = imageDataToDataURL(data);
  }
  catch(e) {
    console.error(e);
  }
}

resizeImage(
  '/assets/beautiful-landscape.jpg',
  384, 
  190
);
```



UI unblock
----------
Image processing is an intensive CPU time consumption job. The data is processed in a very big loop inside the same [Event loop] iteration and, done in browser, may cause significant UI hickups. The solution may be to perform image processing in other thread with the help of the [WebWorker][WebWorkers]. However it is possible to avoid blocking the UI thread by performing the work in range of many Event loop iterations.

This function reserves 10ms of every Event loop iteration to process data.



Performance
-----------
This function uses the technique, proposed by [Paul Rouget] in his [article][1] about pixel manipulation with [Typed Arrays]. His method reduces the number of read/write operations to the [`ArrayBuffer`] of the [`ImageData`] returned by the [`CanvasRenderingContext2D.getImageData()`] method. It saves the overall processing time when iterating through every pixel in the image.

The usage of [`Math`] is avoided in favour of [Bitwise operators], giving a significant boost in performance in some browsers.

To save even more memory and time, scaling, cropping and rotating operations are performed in scope of the same loop.



Install
-------
```
npm i scale-crop-rotate
```



Syntax
------
```javascript
scaleCropRotate(source[, width, height[, cropX, cropY, cropWidth, cropHeight[, rotate[, enableSyncMode]]]]);
scaleCropRotate(source[, width, height[, rotate[, enableSyncMode]]]);
scaleCropRotate(source[, cropX, cropY, cropWidth, cropHeight[, rotate[, enableSyncMode]]]);
scaleCropRotate(source[, rotate[, enableSyncMode]]);
```

### Parameters

#### source
The source image data, should be an instance of the [`ImageData`].

#### width
A [`Number`] indicating width of the resulting image. If the value is `0`, the width is adapted to keep the same aspect ratio as in the source image.

#### height
A [`Number`] indicating height of the resulting image. If the value is `0`, the height is adapted to keep the same aspect ratio as in the source image.

#### cropX
A [`Number`] indicating distance from the left side of the source image to draw into the destination context. This allows to crop the source image from the left side. The default value is calculated to position the cropping area in center of the source image.

#### cropY
A [`Number`] indicating distance from the top side of the source image to draw into the destination context. This allows to crop the source image from the top side. The default value is calculated to position the cropping area in center of the source image.

#### cropWidth
A [`Number`] indicating the width of the area that will be transfered from the source image to the destination image. The default value is calculated to position the cropping area in center of the source image.

#### cropHeight
A [`Number`] indicating the height of the area that will be transfered from the source image to the destination image. The default value is calculated to position the cropping area in center of the source image.

#### rotate
A [`Number`] representing the [Exif Orientation Tag], or a [`DOMString`] containig one of predefined rotation values: `90deg`, `180deg`, `270deg`, `horizontal`, `vertical`. Last two predefined values allow to mirror image horizontally and vertically.

#### enableSyncMode
A [`Boolean`] switch forces function to work in syncronous mode. In this case funcion overall execution time is faster, but it blocks the UI.

### Return values
#### Async mode
A [`Promise`] that resolves with an [`ImageData`] containing the resulting image. A [`Promise`] is extended with the `.progress()` method that recieves a `function` as an argument to handle the image processing progress.

#### Sync mode
An [`ImageData`] containing the resulting image.



Other libraries
---------------
Check other great libraries to do in-browser image resizing:
- [pica] is great image resizing tool with support of [WebWorkers] and [WebAssembly] from the box
- [Hermite-resize] does image resize/resample using Hermite filter and [WebWorkers]



License
-------
MIT



[`ArrayBuffer`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer "The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer. You cannot directly manipulate the contents of an ArrayBuffer; instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format, and use that to read and write the contents of the buffer."

[`Boolean`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean "The Boolean object is an object wrapper for a boolean value."

[`CanvasRenderingContext2D.getImageData()`]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData "The CanvasRenderingContext2D.getImageData() method of the Canvas 2D API returns an ImageData object representing the underlying pixel data for the area of the canvas denoted by the rectangle which starts at (sx, sy) and has an sw width and sh height. This method is not affected by the canvas transformation matrix."

[`DOMString`]: https://developer.mozilla.org/en-US/docs/Web/API/DOMString "DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String."

[`ImageData`]: https://developer.mozilla.org/en-US/docs/Web/API/ImageData "The ImageData interface represents the underlying pixel data of an area of a <canvas> element. It is created using the ImageData() constructor or creator methods on the CanvasRenderingContext2D object associated with a canvas: createImageData() and getImageData(). It can also be used to set a part of the canvas by using putImageData()."

[`Math`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math "Math is a built-in object that has properties and methods for mathematical constants and functions. Not a function object."

[`Number`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number "The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."

[`Promise`]: https://developer.mozilla.org/en-US/docs/Web/API/Promise "The Promise interface represents a proxy for a value not necessarily known at its creation time. It allows you to associate handlers to an asynchronous action's eventual success or failure. This lets asynchronous methods return values like synchronous methods: instead of the final value, the asynchronous method returns a promise of having a value at some point in the future."

[1]: https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/ "Faster Canvas Pixel Manipulation with Typed Arrays"

[Bitwise operators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators "Bitwise operators treat their operands as a sequence of 32 bits (zeroes and ones), rather than as decimal, hexadecimal, or octal numbers. For example, the decimal number nine has a binary representation of 1001. Bitwise operators perform their operations on such binary representations, but they return standard JavaScript numerical values."

[Event loop]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop "JavaScript has a concurrency model based on an \"event loop\". This model is quite different from models in other languages like C and Java."

[Exif Orientation Tag]: http://sylvana.net/jpegcrop/exif_orientation.html "Orientation Tag indicate the orientation of the camera relative to the captured scene"

[Hermite-resize]: https://github.com/viliusle/Hermite-resize "Canvas image resize/resample using Hermite filter with JavaScript."

[pica]: https://github.com/nodeca/pica "Resize image in browser with high quality and high speed."

[Paul Rouget]: http://paulrouget.com/

[Typed Arrays]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays "JavaScript typed arrays are array-like objects and provide a mechanism for accessing raw binary data."

[WebAssembly]: https://developer.mozilla.org/en-US/docs/WebAssembly "WebAssembly is a new type of code that can be run in modern web browsers — it is a low-level assembly-like language with a compact binary format that runs with near-native performance and provides languages such as C/C++ with a compilation target so that they can run on the web. It is also designed to run alongside JavaScript, allowing both to work together."

[WebWorkers]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API "Web Workers makes it possible to run a script operation in background thread separate from the main execution thread of a web application. The advantage of this is that laborious processing can be performed in a separate thread, allowing the main (usually the UI) thread to run without being blocked/slowed down."
