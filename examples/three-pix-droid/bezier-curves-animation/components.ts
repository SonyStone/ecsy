import { Vector2 } from '../vector-2';


export class BezierCurvesConfig {
  curvesNum = 40;
  waveSpeed = 1;
  wavesToBlend = 4; // waves count to blend
  framesToMove = 120; // frames count to change type placement
  controlsNum = 3; // first for control x1 bezierCurve, second for control y1 (bc) and third for control x2 (bc)
}

export class FrameCounter {
  frameCounter = 0;
}

export class WaveNoise {
  size = 1;
  wavesSet = [];

  constructor() {
    this.reset();
  }

  get() {
    let blendedWave = 0;
    for (const e of this.wavesSet) {
      blendedWave += Math.sin(e / 180 * Math.PI); // convert degree to radian and get sine
    }
    return (blendedWave / this.wavesSet.length + 1) / 2;
  }

  reset() {
    for(let i = 0 ; i < this.size; ++i) {
      const randomAngle = Math.random() * 360; // generate random degree
      this.wavesSet.push(randomAngle);
    }
  }
}

export class Start extends Vector2 {}
export class Control1 extends Vector2 {}
export class Control2 extends Vector2 {}
export class End extends Vector2 {}
export class Alpha {
  alpha = 0;
}