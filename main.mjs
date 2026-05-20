import Wheel from  './wheel.mjs';
import Grids from './grids.mjs';

const init = () => {
  const canvas = document.querySelector('#canvas');
  const w = new Wheel(canvas, [1,1,1,1]);
  const g = new Grids(canvas, [1,1,1,1]);
}

document.addEventListener('DOMContentLoaded', (e) => {
  init();
});
