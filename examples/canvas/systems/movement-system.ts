import { System, Read, SystemData } from '@ecs';

import {
  Acceleration,
  CanvasContext,
  Circle,
  DemoSettings,
  PerformanceCompensation,
  Position,
  Velocity,
} from '../components';

@SystemData(
  [Read(Circle), Read(Velocity), Read(Acceleration), Read(Position)],
  Read(PerformanceCompensation),
  Read(CanvasContext),
  Read(DemoSettings),
)
export class MovementSystem implements System {

  run(
    entities: [Circle, Velocity, Acceleration, Position][],
    performance: PerformanceCompensation[],
    canvas: CanvasContext[],
    settings: DemoSettings[],
  ) {

    const delta = performance[0].delta;
    const canvasContext = canvas[0];
    const multiplier = settings[0].speedMultiplier;

    const canvasWidth = canvasContext.width;
    const canvasHeight = canvasContext.height;

    for (let i = 0; i < entities.length; i++) {
      const circle = entities[i][0];
      const velocity = entities[i][1];
      const acceleration = entities[i][2];
      const position = entities[i][3];

      position.x +=
        velocity.x * acceleration.x * delta * multiplier;
      position.y +=
        velocity.y * acceleration.y * delta * multiplier;

      if (acceleration.x > 1) {
        acceleration.x -= delta * multiplier;
      }
      if (acceleration.y > 1) {
        acceleration.y -= delta * multiplier;
      }
      if (acceleration.x < 1) { acceleration.x = 1; }
      if (acceleration.y < 1) { acceleration.y = 1; }

      if (position.y + circle.radius < 0) {
        position.y = canvasHeight + circle.radius;
      }

      if (position.y - circle.radius > canvasHeight) {
        position.y = -circle.radius;
      }

      if (position.x - circle.radius > canvasWidth) {
        position.x = -circle.radius;
      }

      if (position.x + circle.radius < 0) {
        position.x = canvasWidth + circle.radius;
      }
    }
  }
}
