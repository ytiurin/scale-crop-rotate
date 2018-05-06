/*
   scale-crop-rotate 1.0.0
   Scale, crop and rotate images, not blocking UI.
   https://github.com/ytiurin/scale-crop-rotate#readme
   Eugene Tiurin <yevhentiurin@gmail.com>
   Under MIT license
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.scaleCropRotate = factory();
    }
}(this, function () {

var ERROR_ARGUMENT0_TYPE = new TypeError("First arguments should be an instance of ImageData.");

var SCALE_METHOD_IDENTITY = 0;
var SCALE_METHOD_AVARAGE  = 1;
var SCALE_METHOD_LINEAR   = 2;

function binToRgba(px) {
  return [
    px <<  24 >>> 24,
    px <<  16 >>> 24,
    px <<  8  >>> 24,
    px >>> 24
  ];
}

function ceil(val) {
  return (val + .9999) << 0;
}

function floor(val) {
  return val << 0;
}

function interpolate(c, c1, c2, g1, g2) {
  return (((c2 - c) / (c2 - c1)) || .5) * g1 +
         (((c - c1) / (c2 - c1)) || .5) * g2;
}

function round(val) {
  return (val + .5) << 0;
}

function withRgba(RGBA1, RGBA2, op) {
  if (!op) {
    op = RGBA2;
    RGBA2 = [];
  }

  return [
    op(RGBA1[0], RGBA2[0]),
    op(RGBA1[1], RGBA2[1]),
    op(RGBA1[2], RGBA2[2]),
    op(RGBA1[3], RGBA2[3]),
  ];
}

function scaleCropRotate(sourceImageData)
{
  var ImageData = ImageData || this.ImageData;

  var args      = arguments;
  var SYNC_MODE = 0;

  if (args[args.length - 1] === true) {
    var SYNC_MODE = 1;
  }

  if (!(sourceImageData instanceof ImageData)) {
    if (SYNC_MODE) {
      throw ERROR_ARGUMENT0_TYPE;
    }
    else {
      return Promise.reject(ERROR_ARGUMENT0_TYPE);
    }
  }

  var SOURCE_WIDTH  = sourceImageData.width;
  var SOURCE_HEIGHT = sourceImageData.height;

  var DEST_WIDTH  = SOURCE_WIDTH;
  var DEST_HEIGHT = SOURCE_HEIGHT;
  var CROP_X      = 0;
  var CROP_Y      = 0;
  var CROP_WIDTH  = SOURCE_WIDTH;
  var CROP_HEIGHT = SOURCE_HEIGHT;
  var ROTATE      = 1;

  switch (args.length - (SYNC_MODE >> 0)) {
    case 2:
      ROTATE      = args[1];
      break;
    case 3:
      DEST_WIDTH  = args[1];
      DEST_HEIGHT = args[2];
      break;
    case 4:
      DEST_WIDTH  = args[1];
      DEST_HEIGHT = args[2];
      ROTATE      = args[3];
      break;
    case 5:
      CROP_X      = args[1];
      CROP_Y      = args[2];
      CROP_WIDTH  = args[3];
      CROP_HEIGHT = args[4];
      break;
    case 6:
      CROP_X      = args[1];
      CROP_Y      = args[2];
      CROP_WIDTH  = args[3];
      CROP_HEIGHT = args[4];
      ROTATE      = args[5];
      break;
    case 7:
      DEST_WIDTH  = args[1];
      DEST_HEIGHT = args[2];
      CROP_X      = args[3];
      CROP_Y      = args[4];
      CROP_WIDTH  = args[5];
      CROP_HEIGHT = args[6];
      break;
    case 8:
      DEST_WIDTH  = args[1];
      DEST_HEIGHT = args[2];
      CROP_X      = args[3];
      CROP_Y      = args[4];
      CROP_WIDTH  = args[5];
      CROP_HEIGHT = args[6];
      ROTATE      = args[7];
  }

  switch (args.length - (SYNC_MODE >> 0)) {
    case 3:
    case 4:
      var sourceRatio = SOURCE_WIDTH / SOURCE_HEIGHT;
      var destRatio   = DEST_WIDTH   / DEST_HEIGHT;

      if (sourceRatio > destRatio) {
        CROP_WIDTH = round(SOURCE_HEIGHT * destRatio);
        CROP_X     = round((SOURCE_WIDTH - CROP_WIDTH) / 2);
      }
      else
      if (sourceRatio < destRatio) {
        CROP_HEIGHT = round(SOURCE_WIDTH / destRatio);
        CROP_Y      = round((SOURCE_HEIGHT - CROP_HEIGHT) / 2);
      }
  }

  ROTATE = ({
    '90deg'      : 8,
    '180deg'     : 3,
    '270deg'     : 6,
    'horizontal' : 2,
    'vertical'   : 4
  })[ROTATE] || ROTATE;

  var ROTATED_DEST_WIDTH  = DEST_WIDTH;
  var ROTATED_DEST_HEIGHT = DEST_HEIGHT;

  switch(ROTATE) {
    case 5:
    case 6:
    case 7:
    case 8:
      ROTATED_DEST_WIDTH  = DEST_HEIGHT;
      ROTATED_DEST_HEIGHT = DEST_WIDTH;
  };

  var destImageData = new ImageData(ROTATED_DEST_WIDTH, ROTATED_DEST_HEIGHT);
  var destData      = new Int32Array(destImageData.data.buffer);
  var sourceData    = new Int32Array(sourceImageData.data.buffer);

  var SCALE_FACTOR_X  = DEST_WIDTH  / CROP_WIDTH;
  var SCALE_FACTOR_Y  = DEST_HEIGHT / CROP_HEIGHT;
  var SCALE_RANGE_X   = round(1 / SCALE_FACTOR_X) || 1;
  var SCALE_RANGE_Y   = round(1 / SCALE_FACTOR_Y) || 1;
  var SCALE_RANGE_SQR = SCALE_RANGE_X * SCALE_RANGE_Y;

  var scaleMethod = SCALE_FACTOR_X === 1 ? SCALE_METHOD_IDENTITY
    : (SCALE_FACTOR_X < 1 ? SCALE_METHOD_AVARAGE
    : (SCALE_FACTOR_X > 1 ? SCALE_METHOD_LINEAR
    : 0));

  var destX = 0;
  var destY = 0;

  function chunkLoop() {
    var loopStart = new Date;

    do {
      var destPx = [0, 0, 0, 0];

      switch (scaleMethod) {
        case SCALE_METHOD_AVARAGE:
          var sourceInd = CROP_X + floor(destX / SCALE_FACTOR_X) +
            (CROP_Y + floor(destY / SCALE_FACTOR_Y)) * SOURCE_WIDTH;

          for (var sourceY = 0; sourceY < SCALE_RANGE_Y; sourceY++) {
            for (var sourceX = 0; sourceX < SCALE_RANGE_X; sourceX++) {
              var sourcePx = binToRgba(sourceData[sourceInd + sourceX + sourceY
                * SOURCE_WIDTH]);

              destPx = withRgba(destPx, sourcePx, function(g1, g2) {
                return g1 + g2;
              });
            };
          };

          destPx = withRgba(destPx, function(g) {
            return round(g / SCALE_RANGE_SQR);
          });
          break;

        case SCALE_METHOD_IDENTITY:
          var sourceInd = destX + destY * SOURCE_WIDTH;
          destPx = binToRgba(sourceData[sourceInd]);
          break;

        case SCALE_METHOD_LINEAR:
          var x  = destX / SCALE_FACTOR_X;
          var x1 = floor(x);
          var x2 = ceil(x);
          if (x2 > SOURCE_WIDTH - 1) {
            x  = x1;
            x2 = x1;
          }
          var y  = destY / SCALE_FACTOR_Y;
          var y1 = floor(y);
          var y2 = ceil(y);
          if (y2 > SOURCE_HEIGHT - 1) {
            y  = y1;
            y2 = y1;
          }
          var px11 = binToRgba(sourceData[x1 + y1 * SOURCE_WIDTH]);
          var px12 = binToRgba(sourceData[x1 + y2 * SOURCE_WIDTH]);
          var px21 = binToRgba(sourceData[x2 + y1 * SOURCE_WIDTH]);
          var px22 = binToRgba(sourceData[x2 + y2 * SOURCE_WIDTH]);

          var destPxy1 = withRgba(px11, px21, function(g1, g2) {
            return interpolate(x, x1, x2, g1, g2)
          });

          var destPxy2 = withRgba(px12, px22, function(g1, g2) {
            return interpolate(x, x1, x2, g1, g2)
          });

          destPx = withRgba(destPxy1, destPxy2, function(g1, g2) {
            return interpolate(y, y1, y2, g1, g2)
          });
      }

      var rotatedDestX = destX;
      var rotatedDestY = destY;

      switch(ROTATE) {
        case 2:
        case 3:
          rotatedDestX = DEST_WIDTH - destX;
          break;
        case 5:
        case 6:
          rotatedDestX = destY;
          break;
        case 7:
        case 8:
          rotatedDestX = DEST_HEIGHT - destY;
      };

      switch(ROTATE) {
        case 3:
        case 4:
          rotatedDestY = DEST_HEIGHT - destY;
          break;
        case 5:
        case 8:
          rotatedDestY = destX;
          break;
        case 6:
        case 7:
          rotatedDestY = DEST_WIDTH - destX;
      };

      destData[rotatedDestX + rotatedDestY * ROTATED_DEST_WIDTH] =
        (destPx[3] << 24) |
        (destPx[2] << 16) |
        (destPx[1] << 8)  |
        destPx[0];

      if (++destX === DEST_WIDTH) {
        destX = 0;
        destY++;
      }

      allDone = destY === DEST_HEIGHT && !destX;
    }
    while ((SYNC_MODE || (new Date - loopStart) < 10) && !allDone);

    if (!SYNC_MODE) {
      progress((destY * DEST_WIDTH + destX) / (DEST_HEIGHT * DEST_WIDTH));

      if (allDone) {
        resolveResult(destImageData);
      }
      else {
        requestAnimationFrame(chunkLoop);
      }
    }
  }

  if (SYNC_MODE) {
    chunkLoop();
    return destImageData;
  }
  else {
    requestAnimationFrame(chunkLoop);

    var allDone = !1;
    var resolveResult = new Function;
    var progress = new Function;

    var promise = new Promise(function(resolve) {
      resolveResult = resolve;
    });

    promise.progress = function(userProgress) {
      if (typeof userProgress === 'function') {
        progress = userProgress;
      }
      return this;
    };

    return promise;
  }
}
    return scaleCropRotate
}));