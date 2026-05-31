import previewFrames from './previewFrames.mjs';
import Grids from './grids.mjs';

const SPECIAL_PIP_DIST_FROM_PAKU = 3;

class Ghost {
  static color = [255,0,0,1];
  static weakColor = [0,0,255,1];

  static weakSpeedMod = 0.7;
  static seesPakuSpeedMod = 1.2;

  framesPerMove = 12;
  location = 12;
  direction = 1;
  state = 'alive'; // alive | weak | dead
  visionDepth = 5;
  
  deadAnimFrame = 0;
  seesPaku = false;

  deadTimer = 0;
  weakTimer = 0;

  difficulty = 0;

  update(frameNum, pakuLocation) {
    this.updateStateTimers();
    this.checkPaku(pakuLocation);
    if (0 === Math.floor(frameNum % this.getFramesPerMove())) {
      this.location = (this.location + this.direction + 16) % 16;
    }
  }

  // dedup?
  die() {
    this.state = 'dead';
    this.deadTimer = 16 * 12;
    this.seesPaku = false;
  }

  weak() {
    this.state = 'weak';
    if (this.seesPaku) {
      this.seesPaku = false;
    }
    this.weakTimer = 12 * 12;
  }

  getFramesPerMove() {
    let speed = this.framesPerMove;

    if ('weak' === this.state) {
      speed /= Ghost.weakSpeedMod;
    } else if ('alive' === this.state) {
      if (this.seesPaku) {
        speed /= Ghost.seesPakuSpeedMod;
      }

      speed -= 0.35 * this.difficulty;
    }

    return speed;
  }

  updateStateTimers() {
    switch (this.state) {
        // consolidate?
      case 'weak':
        if (--this.weakTimer === 0) {
          this.state = 'alive';
        }
        break;
      case 'dead':
        if (--this.deadTimer === 0) {
          this.state = 'alive';
        }
        break;
    }
  }

  checkPaku(frameNum, pakuLocation) {
    if (0 === Math.floor(frameNum % this.getFramesPerMove())) {

      const aheadDist = (pakuLocation - this.location + 16) % 16;
      const behindDist = (this.location - pakuLocation + 16) % 16;

      const pakuAhead = aheadDist > 0 && aheadDist <= this.visionDepth;
      const pakuBehind = behindDist > 0 && behindDist <= this.visionDepth;

      if (pakuAhead || pakuBehind) {
        if (!this.seesPaku) {
          this.seesPaku = true;
        }

        // turn to face if alive; run if dead
        // otherwise wander
        if (
          (this.direction < 0 && pakuAhead && 'alive' === this.state) ||
          (this.direction < 0 && pakuBehind && 'weak' === this.state)
        ) {
          this.direction = 1;
        } else if (
          (this.direction > 0 && pakuBehind && 'alive' === this.state) ||
          (this.direction > 0 && pakuAhead && 'weak' === this.state)
        ) {
          this.direction = -1;
        }
      }
    }
  }

  drawWheel(wheelBuffer) {
    switch (this.state) {
      case 'alive': 
        wheelBuffer[this.location] = Ghost.color;
        break;
      case 'weak': 
        wheelBuffer[this.location] = Ghost.weakColor;
        break;
      case 'dead': 
        // play animation`
        // TODO
        wheelBuffer[this.location] = [0,255,255,1];
        break;
    }
  }
}

class Paku {
  framesPerMove = 14;
  location = 4;
  direction = 0;
  directionIntent = null;
  static color = [255,255,0,1];
  static intentToDir = { 'l': -1, 'r': 1 };

  update(frameNum, inputBuffer) {
    if (null !== inputBuffer.direction) {
      this.directionIntent = inputBuffer.direction;
    }

    if (0 === Math.floor(frameNum % this.framesPerMove)) {
      if (null !== this.directionIntent) {
        this.direction = Paku.intentToDir[this.directionIntent] || 0;
      }
      this.location = (this.location + this.direction + 16) % 16;
    }
  }

  drawWheel(wheelBuffer) {
    wheelBuffer[this.location] = Paku.color;
  }
}

class Game {
  // TODO move paku/ghost to new locations to account for animations?
  ghostLocation = 12;
  pips = new Array(16).fill(true);
  specialPipLocation;
  score = 0;
  over = false;
  scoreOffset = 0;
  maxScoreOffset = 0;
  
  constructor() {
    this.paku = new Paku();
    this.ghost = new Ghost();
  }

  setSpecialPip() {
    const valid = [];

    for (let i = 0; i < 16; i++) {
      const dist = (i - this.paku.location + 16) % 16;

      if (
        this.pips[i] &&
        dist >= SPECIAL_PIP_DIST_FROM_PAKU &&
        dist <= 16 - SPECIAL_PIP_DIST_FROM_PAKU
      ) {
        valid.push(i);
      }
    }

    this.specialPipLocation =
      valid[Math.floor(Math.random() * valid.length)];
  }

  update(frameNum, inputBuffer) {
    // handle score sliding
    if (this.maxScoreOffset > 0) {
    }

    if (this.over) {
      // play animation then head to poss high score setting
      return null;
    }

    this.paku.update(frameNum, inputBuffer);

    this.ghost.update(frameNum);

    if (this.pips[this.paku.location]) {
      this.score++;
      this.pips[this.paku.location] = false;
      if (this.paku.location === this.specialPipLocation) {
        if ('alive' === this.ghost.state) {
          this.ghost.weak();
        }
      }
    }

    if (this.paku.location === this.ghost.location) {
      switch (this.ghost.state) {
        case 'alive':
          this.over = true;
          break;
        case 'weak':
          this.ghost.die();
          this.score += 50;
          break;
      }
    }

    // reset pips
    if (this.pips.every(p => !p)) {
      for (let i = this.paku.location + 1; i < this.paku.location + 14; i++) {
        this.pips[i % 16] = true;
      }
      this.setSpecialPip();
      this.ghost.difficulty += 1;
    }

    return null;
  }

  drawWheel(wheelBuffer) {
    for (let i = 0; i < 16; i++) {
      if (this.pips[i]) {
        if (i === this.specialPipLocation) {
          wheelBuffer[i] = [230,255,255,1];
        } else {
          wheelBuffer[i] = [255,255,255,0.5];
        }

      }
    }
    this.paku.drawWheel(wheelBuffer);
    this.ghost.drawWheel(wheelBuffer);
  }

  drawGrid(gridBuffer) {
    const digits = Math.ceil(Math.log10(this.score));
    this.maxScoreOffset = Math.abs(Math.min(0, 2 - digits)) * 4;
    Grids.drawNumber(
      gridBuffer,
      0,
      this.score,
      this.scoreOffset
    );
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
