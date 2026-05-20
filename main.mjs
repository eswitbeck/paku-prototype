import Wheel from  './wheel.mjs';
import Grids from './grids.mjs';

const drawPaku = (buffer, frame, i) => {
  buffer[i] = [255,255,0,1];
  if (0 == frame % 25) {
    return true;
  }
  return false;
}

const init = async () => {
  const canvas = document.querySelector('#canvas');
  const w = new Wheel(canvas, [1,1,1,1]);
  const g = new Grids(canvas, [1,1,1,1]);

  const wheelBuffers = [0,0].map((_, a) =>
    new Array(16).fill(null).map(() => [0,0,0,1])
  );
  const gridBuffers = [0,0].map((_, a) => {
    const b = [];
    for (let i = 0; i < 2; i++) {
      b[i] = [];
      for (let j = 0; j < 7; j++) {
        b[i][j] = [];
        for (let k = 0; k < 5; k++) {
          b[i][j][k] = 0;
        }
      }
    }

    return b;
  });

  const FPS = 60;
  const msPerFrame = 1000 / FPS;

  let nextFrameTime = performance.now();
  const readOnlyFrameRef = [0];
  let i = 0;
  while (true) {
    const now = performance.now();
    if (now < nextFrameTime) {
      await new Promise((res) => setTimeout(res, nextFrameTime - now));
    }

    const t1 = performance.now();

    const frameNum = readOnlyFrameRef[0];
    const activeBufferIndex = frameNum % 2;
    const [wB, gB] = [wheelBuffers, gridBuffers]
      .map(b => b[activeBufferIndex]);

    w.clearBuffer(wB);
    g.clearBuffer(gB);

    // game logic from previously set interaction state
    // draws to activeBuffer
    if (drawPaku(wB, frameNum, i)) i = ++i % 16;

    w.renderBuffer(wB);
    g.renderBuffer(gB);
    readOnlyFrameRef[0] = (1 + frameNum) % FPS;

    nextFrameTime += msPerFrame;
    if (t1 > nextFrameTime + msPerFrame) {
      nextFrameTime = t1 + msPerFrame;
    }
  };
}

document.addEventListener('DOMContentLoaded', (e) => {
  init();
});
