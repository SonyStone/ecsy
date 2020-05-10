import { Read, System, SystemData } from '@ecs';

import { CanvasContext, CanvasSize } from '../canvas-data';
import { Alpha, BezierCurvesConfig, Control1, Control2, End, FrameCounter, Start, WaveNoise } from './components';

@SystemData(
  Read(WaveNoise),
  Read(BezierCurvesConfig),
)
export class UpdateControls implements System {
  run(
    controls: WaveNoise[],
    [{ waveSpeed }]: BezierCurvesConfig[],
  ) {
    for (const { wavesSet } of controls) {
      for (const [i, wave] of wavesSet.entries()) {
        const r = Math.random() * (i + 1) * waveSpeed;
        wavesSet[i] = (wave + r) % 360;
      }
    }
  }
}

@SystemData(
  Read(WaveNoise),
  [Read(Control1), Read(Control2), Read(Alpha)],
  Read(CanvasSize)
)
export class UpdateCurvesSystem implements System {
  run(
    controls: WaveNoise[],
    curves: [Control1, Control2, Alpha][],
    [size]: CanvasSize[]
  ) {
    const control1X = controls[0].get() * size.width; // general controls x1 for all curves
    const control1Y = controls[1].get() * size.height; // general controls y1 for all curves
    const control2X = controls[2].get() * size.width; // general controls x2 for all curves

    for (const [i, [control1, control2, alpha]] of curves.entries()) {
      const controlY2 = controls[3 + i].get() * size.height; // personal control y2 for current curve

      control1.x = control1X;
      control1.y = control1Y;
      control2.x = control2X;
      control2.y = controlY2;

      alpha.alpha = controlY2
    }
  }
}

@SystemData(
  [Read(Start), Read(Control1), Read(Control2), Read(End), Read(Alpha)],
  Read(CanvasContext),
)
export class DrawCurveSystem implements System {
  run(
    curves: [Start, Control1, Control2, End, Alpha][],
    [{ ctx }]: CanvasContext[],
  ) {
    for (const [start, control1, control2, end, alpha] of curves) {

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.alpha})`;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, end.x, end.y);
      ctx.stroke();
    }
  }
}

@SystemData(
  [Read(CanvasSize), Read(FrameCounter), Read(BezierCurvesConfig)],
  [Read(Start), Read(End)],
)
export class UpdateFrameCounterSystem {
  run(
    [[ size, frameCounter , {framesToMove}]]: [CanvasSize, FrameCounter, BezierCurvesConfig][],
    curves: [Start, End][],
  ) {
    frameCounter.frameCounter = (frameCounter.frameCounter + 1) % framesToMove;
    if (frameCounter.frameCounter === 0) {

      const randoms = [Math.random(), Math.random(), Math.random(), Math.random()];

      for (const [i, [start, end]] of curves.entries()) {
        start.x = getYPlacementType(randoms[0], i, size.width, curves.length);
        start.y = getYPlacementType(randoms[2], i, size.height, curves.length);
        end.x = getYPlacementType(randoms[3], i, size.width, curves.length);
        end.y = getYPlacementType(randoms[4], i, size.height, curves.length); // change type for Curve Start
      }
    }
  }
}

// type recorded in (this.type4Start, this.type4End) animation properties
function getYPlacementType(type: number, i: number, size: number, curvesNum: number) {
  if (type > .6) {
    return size / curvesNum * i;
  } else if (type > .4) {
    return size / 2;
  } else if (type > .2) {
    return size;
  } else {
    return 0;
  }
}