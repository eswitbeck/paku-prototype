const PIXEL_COUNT = 16;
const PIXEL_SIZE = 18;
const RADIUS_PROPORTION = 0.6;

class Wheel {
  // some mutability risks I haven't thought about
  constructor(canvas, backgroundColor) {
    this.backgroundColor = backgroundColor;
    this.canvasSize = Math.min(canvas.width, canvas.height);
    this.radius = (this.canvasSize / 2) * RADIUS_PROPORTION;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    this.pixels = [];

    for (let i = 0; i < PIXEL_COUNT; i++) {
      this.pixels[i] = backgroundColor;
    }
  }

  renderPixel(index, arr) {
    const center = this.canvasSize / 2;

    const angle = (Math.PI * 2 * index) / PIXEL_COUNT - (Math.PI / 2);

    const x = center + Math.cos(angle) * this.radius;
    const y = center + Math.sin(angle) * this.radius;

    this.ctx.save();

    this.ctx.translate(x, y);

    this.ctx.rotate(angle + Math.PI / 2);

    // wipe rect with hack
    this.ctx.fillStyle = this._rgbaFromArray(this.backgroundColor);
    this.ctx.fillRect(
      -PIXEL_SIZE / 2 - 1,
      -PIXEL_SIZE / 2 - 1,
      PIXEL_SIZE + 2,
      PIXEL_SIZE + 2
    );

    this.ctx.fillStyle = this._rgbaFromArray(arr);

    this.ctx.fillRect(
      -PIXEL_SIZE / 2,
      -PIXEL_SIZE / 2,
      PIXEL_SIZE,
      PIXEL_SIZE
    );

    this.ctx.restore();
  }
  
  async renderBuffer(buffer) {
    if (buffer.length !== this.pixels.length) {
      console.log(buffer);
      throw new Error('Invalid buffer length');
    }

    const promises = [];
    for (let i = 0; i < this.pixels.length; i++) {
      if (!this._pixelEq(buffer[i], this.pixels[i])) {
        promises[i] = Promise.resolve().then(() => {
          this.renderPixel(i, buffer[i]);
          // mutability risk
          this.pixels[i] = buffer[i];
        });
      }
    }
    return Promise.all(promises);
  }

  _pixelEq(a, b) {
    return a[0] === b[0] &&
      a[1] === b[1] &&
      a[2] === b[2] &&
      a[3] === b[3];
  }

  _rgbaFromArray(array) {
    return `rgba(${array[0]},${array[1]},${array[2]},${array[3]}`;
  }

  clearBuffer(buffer) {
    for (let i = 0; i < this.pixels.length; i++) {
      buffer[i] = this.backgroundColor;
    }
  }
}

export default Wheel;
