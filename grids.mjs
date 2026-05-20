const PIXEL_SIZE = 10;
const PIXEL_GAP = 2;
const GRID_GAP = 8;

class Grids {
  constructor(canvas, backgroundColor) {
    this.backgroundColor = backgroundColor;
    this.canvasSize = Math.min(canvas.width, canvas.height);
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    /**
     * ....... .......
     * ....... .......
     * ....... .......
     * ....... .......
     * ....... .......
     */
    this.pixels = [];

    for (let i = 0; i < 2; i++) {
      this.pixels[i] = [];
      for (let j = 0; j < 5; j++) {
        this.pixels[i][j] = [];
        for (let k = 0; k < 7; k++) {
          this.pixels[i][j][k] = 0;
        }
      }
    }
  }

  renderPixel(i, j, k, val) {
    const center = this.canvasSize / 2;
    const a = center - (2 * PIXEL_GAP) - (2.5 * PIXEL_SIZE);
    const b = center - (0.5 * GRID_GAP) - (7 * PIXEL_SIZE) - (6 * PIXEL_GAP) - (0.5 * PIXEL_SIZE);

    const x = 0.5 * PIXEL_SIZE + 
      (0 === i ? 0 : (7 * PIXEL_SIZE + 6 * PIXEL_GAP + GRID_GAP)) +
      k * PIXEL_SIZE + 
      k * PIXEL_GAP +
      b;
    const y = 0.5 * PIXEL_SIZE + 
      j * PIXEL_SIZE +
      j * PIXEL_GAP +
      a;

    this.ctx.fillStyle = 1 === val
      ? "white"
      : this._rgbaFromArray(this.backgroundColor);

    this.ctx.fillRect(
      x,
      y,
      PIXEL_SIZE,
      PIXEL_SIZE
    );
  }

  async renderBuffer(buffer) {
    if (buffer.length !== 2) {
      throw new Error('buffer does not have 2 grids');
    }
    for (let i = 0; i < 2; i++) {
      const r = buffer[i];
      if (r.length !== 5) {
        throw new Error(`Grid ${i} doesn't have 5 columns`);
      }
      for (let j = 0; j < 5; j++) {
        const c = r[j];
        if (c.length !== 7) {
          throw new Error(`Grid ${i}, row ${j} doesn't have 7 rows`);
        }
      }
    }

    const promises = [];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 5; j++) {
        for (let k = 0; k < 7; k++) {
          const p = this.pixels[i][j][k];
          const b = buffer[i][j][k];
          if (p !== b) {
            promises.push(Promise.resolve().then(() => {
              this.renderPixel(i, j, k, b);
              this.pixels[i][j][k] = b;
            }));
          }
        }
      }
    }

    return Promise.all(promises);
  }

  _rgbaFromArray(array) {
    return `rgba(${array[0]},${array[1]},${array[2]},${array[3]})`;
  }
}

export default Grids;
