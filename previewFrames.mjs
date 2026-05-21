const previewFrames = [];
for (let i = 0; i < 8 * 16; i++) {
  const f = new Array(16).fill(null).map(() => [0, 0, 0, 1]);
  f[Math.floor(i / 8) % 16] = [255, 0, 0, 1];
  previewFrames.push(f);
}


export default previewFrames;
