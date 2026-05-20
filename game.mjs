class Game {
  pakuLocation = 0;
  pakuDirection = 0;

  ghostLocation = 0;

  pakuColor = [255, 255, 0, 1];
  ghostColor = [255, 0, 0, 1];

  ghostFramesPerMove = 17;
  pakuFramesPerMove = 20;

  dead = 0; // 0 = alive, 1 = render last frame, 2 = dead 

  updateState(frameNum, inputState) {
    if (2 === this.dead) return;

    if (0 === frameNum % this.ghostFramesPerMove &&
      1 !== this.dead
    ) {
      this.ghostLocation = (this.ghostLocation + 1) % 16;
    }
    
    const dir = {
      'l': -1,
      'r': 1
    }[ inputState.direction ] || 0;

    if (dir !== 0) {
      this.pakuDirection = dir;
    }

    if (0 === frameNum % this.pakuFramesPerMove &&
      1 !== this.dead
    ) {
      this.pakuLocation = (this.pakuLocation + (this.pakuDirection + 16)) % 16;
    }

    if (1 === this.dead) {
      this.dead = 2;
    } else if (this.pakuLocation === this.ghostLocation) {
      this.dead = 1;
    }
  }

  drawWheel(wheelBuffer) {
    if (2 === this.dead) {
      for (let i = 0; i < 16; i++) {
        wheelBuffer[i] = [255, 0, 0, 1];
      }
      return;
    }

    wheelBuffer[this.pakuLocation] = this.pakuColor;
    wheelBuffer[this.ghostLocation] = this.ghostColor;
  }

  drawGrid(gridBuffer) {
    if (this.dead > 0) {
      // needs ascii or somethign utils
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 7; j++) {
          for (let k = 0; k < 5; k++) {
            gridBuffer[i][j][k] = 1;
          }
        }
      }
    }
  }
}

export default Game;
