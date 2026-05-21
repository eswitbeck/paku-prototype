import previewFrames from './previewFrames.mjs';

const SPECIAL_PIP_DIST_FROM_PAKU = 3;

class Paku {
  framesPerMove = 5;
  location = 4;
  direction = 0;
  directionIntent = null;
  static color = [255,255,0,1];
  static intentToDir = { 'l': -1, 'r': 1 };

  update(frameNum, inputBuffer) {
    if (null !== inputBuffer.direction) {
      this.directionIntent = inputBuffer.direction;
    }

    if (0 === frameNum % this.framesPerMove) {
      if (null !== this.directionIntent) {
        this.direction = Paku.intentToDir[this.directionIntent] || 0;
      }
      this.location = (this.location + this.direction + 16) % 16;
    }
  }

  drawWheel(wheelBuffer) {
    // TODO super paku?
    wheelBuffer[this.location] = Paku.color;
  }
}

class Game {
  // TODO move paku/ghost to new locations to account for animations?
  ghostLocation = 12;
  pips = new Array(16).fill(true);
  specialPipLocation;
  score = 0;
  
  constructor() {
    this.paku = new Paku();
  }

  setSpecialPip() {
    const range = 16 - (2 * SPECIAL_PIP_DIST_FROM_PAKU);
    const loc = Math.round(Math.random() * range) + this.paku.location;
    this.specialPipLocation = loc % 16;

  }

  update(frameNum, inputBuffer) {
    this.paku.update(frameNum, inputBuffer);
    if (this.pips[this.paku.location]) {
      this.score++;
      this.pips[this.paku.location] = false;
      // if special pip
    }

    // reset pips
    if (this.pips.every(p => !p)) {
      for (let i = this.paku.location + 1; i < this.paku.location + 14; i++) {
        this.pips[i % 16] = true;
      }
      this.setSpecialPip();
    }

    return null;
  }

  drawWheel(wheelBuffer) {
    for (let i = 0; i < 16; i++) {
      if (this.pips[i]) {
        wheelBuffer[i] = [255,255,255,1];
      }
    }
    this.paku.drawWheel(wheelBuffer);
  }

  drawGrid(gridBuffer) {
  }
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
    const Cl = modes[mode];
    this.modeObj = new Cl();
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
