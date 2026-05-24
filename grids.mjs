const PIXEL_SIZE = 10;
const PIXEL_GAP = 2;
const GRID_GAP = 8;

class Grids {
  constructor(canvas, backgroundColor) {
    this.backgroundColor = backgroundColor;
    this.canvasSize = Math.min(canvas.width, canvas.height);
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    this.pixels = [];

    for (let i = 0; i < 2; i++) {
      this.pixels[i] = [];
      for (let j = 0; j < 7; j++) {
        this.pixels[i][j] = [];
        for (let k = 0; k < 5; k++) {
          this.pixels[i][j][k] = 0;
        }
      }
    }
  }

  renderPixel(i, j, k, val) {
    const center = this.canvasSize / 2;
    const a = center - (2 * PIXEL_GAP) - (3.5 * PIXEL_SIZE);
    const b = center
			- (0.5 * GRID_GAP)
			- (5 * PIXEL_SIZE)
			- (4 * PIXEL_GAP)
			- (0.5 * PIXEL_SIZE);

    const x = 0.5 * PIXEL_SIZE + 
      j * PIXEL_SIZE +
      j * PIXEL_GAP +
      a;
    const y = 0.5 * PIXEL_SIZE + 
      (0 === i ? 0 : (5 * PIXEL_SIZE + 4 * PIXEL_GAP + GRID_GAP)) +
      k * PIXEL_SIZE + 
      k * PIXEL_GAP +
      b;

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
      if (r.length !== 7) {
        throw new Error(`Grid ${i} doesn't have 7 columns`);
      }
      for (let j = 0; j < 7; j++) {
        const c = r[j];
        if (c.length !== 5) {
          throw new Error(`Grid ${i}, row ${j} doesn't have 5 rows`);
        }
      }
    }

    const promises = [];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 7; j++) {
        for (let k = 0; k < 5; k++) {
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

  clearBuffer(buffer) {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 7; j++) {
        for (let k = 0; k < 5; k++) {
          buffer[i][j][k] = 0;
        }
      }
    }
  }

  static drawGlyph(
    gridBuffer,
    row,
    glyph,
    offset = 0
  ) {
    const lines = glyph.split("\n");
    const height = lines.length;
    const width = lines.reduce(
      (a, b) => Math.max(a, b.length),
      0
    );

    for (let i = offset; i < Math.min(width + offset, 7); i++) {
      for (let j = 0; j < Math.min(height, 5); j++) {
        const k = i - offset;
        if ('*' === lines[j][k]) {
          gridBuffer[row][i][j] = 1;
        } else {
          gridBuffer[row][i][j] = 0;
        }
      }
    }
  }
}

export default Grids;
