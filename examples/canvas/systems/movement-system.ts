import { System, Read, SystemData } from '@ecs';

import {
  Acceleration,
  CanvasContext,
  Circle,
  DemoSettings,
  PerformanceСompensation,
  Position,
  Velocity,
} from '../components';

@SystemData(
  [Read(Circle), Read(Velocity), Read(Acceleration), Read(Position)],
  [Read(PerformanceСompensation), Read(CanvasContext), Read(DemoSettings)],
)
export class MovementSystem implements System {

  run(
    entities: [Circle, Velocity, Acceleration, Position][],
    [[{delta}, canvasContext, {speedMultiplier: multiplier}]]: [PerformanceСompensation, CanvasContext, DemoSettings][],
  ) {

    const canvasWidth = canvasContext.width;
    const canvasHeight = canvasContext.height;

    for (const [circle, velocity, acceleration, position] of entities) {

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
