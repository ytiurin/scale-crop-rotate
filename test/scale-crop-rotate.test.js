const { ImageData, Uint8ClampedArray, } = require('canvas');
const scaleCropRotate = require('../dist/scale-crop-rotate.js')
  .bind({ ImageData: ImageData });

describe('Async mode', () => {
  test('Obligate 1st argument', () => {
    expect.assertions(1);
    return expect(scaleCropRotate()).
      rejects.toBeInstanceOf(TypeError);
  });

  test('1st argument should be an instance of ImageData', () => {
    expect.assertions(1);
    return expect(scaleCropRotate(1)).
      rejects.toBeInstanceOf(TypeError);
  });

  test('Result should be an instance of Promise', () => {
    const data = new ImageData(1, 1);
    expect.assertions(1);
    return expect(scaleCropRotate(data)).
      toBeInstanceOf(Promise);
  });
});

describe('Sync mode', () => {
  test('Throws an error', () => {
   expect(() => {
     scaleCropRotate(true);
   }).toThrowError('instance of ImageData');
  });

  test('Result should be an instance of ImageData', () => {
    const data = new ImageData(1, 1);
    expect.assertions(1);
    return expect(scaleCropRotate(data, true)).
      toBeInstanceOf(ImageData);
  });
});

describe('Rotate', () => {
  test('90deg', () => {
    const data = new ImageData(1, 2);
    const r = scaleCropRotate(data, 8, true);
    expect(r.width).toBe(2);
    expect(r.height).toBe(1);
  });

  test('180deg', () => {
    const data = new ImageData(1, 2);
    const r = scaleCropRotate(data, 3, true);
    expect(r.width).toBe(1);
    expect(r.height).toBe(2);
  });

  test('270deg', () => {
    const data = new ImageData(1, 2);
    const r = scaleCropRotate(data, 6, true);
    expect(r.width).toBe(2);
    expect(r.height).toBe(1);
  });
});

describe('Scale', () => {
  test('Identity', () => {
    const data = new ImageData(1, 1);
    const r = scaleCropRotate(data, 1, 1, true);
    expect(r).toEqual(data);
  });

  test('Downscale', () => {
    const data = new ImageData(2, 2);
    const r = scaleCropRotate(data, 1, 1, true);
    expect(r.width).toBe(1);
    expect(r.height).toBe(1);
  });

  test('Upscale', () => {
    const data = new ImageData(1, 1);
    const r = scaleCropRotate(data, 2, 2, true);
    expect(r.width).toBe(2);
    expect(r.height).toBe(2);
  });
});

describe('Scale and Rotate', () => {
  test('Identity and Rotate 90deg', () => {
    const data = new ImageData(1, 2);
    const r = scaleCropRotate(data, 1, 2, 8, true);
    expect(r.width).toBe(2);
    expect(r.height).toBe(1);
  });
});

describe('Crop', () => {
  test('Populate neighbour pixel', () => {
    const data = new ImageData(2, 1);
    data.data[0] = 255;
    const r = scaleCropRotate(data, 0, 0, 1, 1, true);
    expect(r.data[4]).not.toBe(0);
  });
});

describe('Scale and Crop', () => {
  test('Upscale and Populate neighbour pixel', () => {
    const data = new ImageData(2, 1);
    data.data[0] = 255;
    const r = scaleCropRotate(data, 2, 2, 0, 0, 1, 1, true);
    expect(r.width).toBe(2);
    expect(r.height).toBe(2);
    expect(r.data[12]).not.toBe(0);
  });
});

describe('Scale, Crop and Rotate', () => {
  test('Upscale, Populate neighbour pixel and Rotate 90deg', () => {
    const data = new ImageData(2, 1);
    data.data[0] = 255;
    const r = scaleCropRotate(data, 2, 2, 0, 0, 1, 1, 8, true);
    expect(r.width).toBe(2);
    expect(r.height).toBe(2);
    expect(r.data[4]).toBe(255);
  });
});
