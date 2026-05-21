import previewFrames from './previewFrames.mjs';

class Game {
}
class Preview {
  dir = 0;
  loggedInputDir = null;

  animFrame = 0;

  static update = {
      'r': 1,
      'l': -1
  };

  update(frameNum, inputBuffer) {
    // this import is dumb and silly
    this.animFrame = (this.animFrame + 1) % previewFrames.length;
    if (null !== inputBuffer.direction) {
      this.loggedInputDir = inputBuffer.direction;
    }

    if (0 === (frameNum % 5)) {
      this.dir += Preview.update[this.loggedInputDir] || 0;
      this.loggedInputDir = null;
      console.log(this.dir);
    }

    if (17 === this.dir) {
      return 'game';
    } else if (-17 === this.dir) {
      return 'highscore';
    } else {
      return null;
    }
  }

  drawGrid(gridBuffer) {
  }

  drawWheel(wheelBuffer) {
    // TODO flat buffer with direct write ins
    const pos = this.dir > 0;
    const color = pos > 0 ? [0,255,0,1] : [0,0,255,1];
     
    const f = previewFrames[this.animFrame];
    console.log(f);
    for (let i = 0; i < f.length; i++) {
      wheelBuffer[i] = f[i];
    }

    for (let i = 0; i < Math.min(16, Math.abs(this.dir)); i++) {
      wheelBuffer[(i * Math.sign(this.dir) + 16) % 16] = color;
    }
  }
}
class HighScore {
}

const modes = {
  'preview': Preview,
  'game': Game,
  'highscore': HighScore
}

class GameState {
  mode = 'preview';
  modeObj;

  constructor () {
    this.changeMode(this.mode);
  }

  changeMode(mode) {
    const cl = modes[mode];
    this.modeObj = new cl();
  }

  handleInput(frameNum, inputState) {
    return this.modeObj.update(frameNum, inputState);
  }

  drawWheel(wheelBuffer) {
    this.modeObj.drawWheel(wheelBuffer);
  }

  drawGrid(gridBuffer) {
    this.modeObj.drawGrid(gridBuffer);
  }
}

export default GameState;
