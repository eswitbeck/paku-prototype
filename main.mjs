import Wheel from  './wheel.mjs';

const addElement = (parent, type, options) => {
  switch (type) {
    case 'text':
      {
        const el = document.createElement('text');
        el.textContent = options?.body ?? '';
        parent.appendChild(el);
      }
    default:
      {
        const el = document.createElement(type);
        parent.appendChild(el);
      }
  };
}

const init = () => {
  const canvas = document.querySelector('#canvas');
  const w = new Wheel(canvas, [1,1,1,1]);
}

document.addEventListener('DOMContentLoaded', (e) => {
  init();
});
