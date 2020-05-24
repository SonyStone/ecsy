import './index.scss';

import { World } from '@ecs';

import { CanvasContext, CanvasData, CanvasSize } from '../../utils/canvas-data';
import { BackgroundColor } from '../particles-with-connection/components';
import { DrawBackgroundSystem } from '../particles-with-connection/systems';
import { Alpha, BezierCurvesConfig, Control1, Control2, End, FrameCounter, Start, WaveNoise } from './components';
import { DrawCurveSystem, UpdateControls, UpdateCurvesSystem, UpdateFrameCounterSystem } from './systems';


// Setup World
{
  const world = new World();

  const canvas = new CanvasData(document.querySelector('canvas'));

  const singletonEntity = world.createEntity()
    .addComponent(CanvasSize, canvas.getSize())
    .addComponent(CanvasContext, canvas.getContext())
    .addComponent(BackgroundColor)
    .addComponent(BezierCurvesConfig)
    .addComponent(FrameCounter)

  const canvasSize = singletonEntity.getComponent(CanvasSize);
  canvas.resizeUpdater(canvasSize);

  const config = singletonEntity.getComponent(BezierCurvesConfig);

  for(let i = 0 ; i < (config.controlsNum + config.curvesNum) ; i++){
    world.createEntity()
      .addComponent(WaveNoise, { size: 1 })
  }

  for (let i = 0; i < config.curvesNum; i++) {
    world.createEntity()
      .addComponent(Start, { x: 0, y: 0})
      .addComponent(Control1)
      .addComponent(Control2)
      .addComponent(End, { x: canvasSize.width, y: canvasSize.height})
      .addComponent(Alpha)
  }

  world
    .registerSystem(DrawBackgroundSystem)
    .registerSystem(UpdateCurvesSystem)
    .registerSystem(UpdateFrameCounterSystem)
    .registerSystem(UpdateControls)
    .registerSystem(DrawCurveSystem)
    // .registerSystem(DrawLinesSystem)

  const run = () => {
    // Run all the systems
    world.run();

    requestAnimationFrame(run);
  }

  run();
}