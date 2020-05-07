import { Read, System, SystemData } from '@ecs';

import { CanvasContext, CanvasSize } from '../canvas-data';
import { Point } from '../point';
import { Velocity } from '../velocity';
import { BackgroundColor, LineProperties, Particle, ParticleProperties } from './components';

@SystemData(
  [Read(CanvasContext), Read(CanvasSize), Read(BackgroundColor)]
)
export class DrawBackgroundSystem implements System {
  run([[{ ctx }, { width, height }, { bgColor }]]: [CanvasContext, CanvasSize, BackgroundColor][]) {
    ctx.globalCompositeOperation = `normal`;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }
}

@SystemData(
  [Read(Point), Read(Velocity), Read(Particle)],
  [Read(CanvasSize), Read(ParticleProperties)]
)
export class CalculateLifeSystem implements System {
  run(
    particles: [Point, Velocity, Particle][],
    [[{ width, height }, { maxVelocity, life}]]: [CanvasSize, ParticleProperties][]
  ) {
    for (const [point, velocity, particle] of particles) {
      if (particle.life < 1) {
        point.x = Math.random() * width;
        point.y = Math.random() * height;
        velocity.x = Math.random() * (maxVelocity * 2) - maxVelocity;
        velocity.y = Math.random() * (maxVelocity * 2) - maxVelocity;
        particle.life = Math.random() * life * 60;
      }
      particle.life--;
    }
  }
}

@SystemData(
  [Read(Point), Read(Velocity), Read(Particle)],
  Read(CanvasSize),
)
export class ParticlesPositionSystem implements System {
  run(
    particles: [Point, Velocity, Particle][],
    [{ width, height }]: CanvasSize[]
  ) {
    for (const [point, velocity, particle] of particles) {

      velocity.x =
        (point.x + velocity.x > width && velocity.x > 0)
        || (point.x + velocity.x < 0 && velocity.x < 0)
          ? velocity.x * -1
          : velocity.x;

      velocity.y =
        (point.y + velocity.y > height && velocity.y > 0)
        || (point.y + velocity.y < 0 && velocity.y < 0)
          ? velocity.y * -1
          : velocity.y;

      point.x += velocity.x;
      point.y += velocity.y;
    }
  }
}

@SystemData(
  Read(Point),
  [Read(CanvasContext), Read(ParticleProperties)]
)
export class DrawParticlesSystem implements System {
  run(
    points: Point[],
    [[{ ctx }, { radius, color }]]: [CanvasContext, ParticleProperties][]
  ) {
    for (const point of points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}

@SystemData(
  Read(Point),
  [Read(CanvasContext), Read(LineProperties)]
)
export class DrawLinesSystem implements System {
  run(
    points: Point[],
    [[{ ctx }, { length: lineLength, color }]]: [CanvasContext, LineProperties][],
  ) {
    for (const { x: x1, y: y1 } of points) {
      for (const { x: x2, y: y2 } of points) {
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        if (length < lineLength) {
          const opacity = 1 - length / lineLength;
          ctx.lineWidth = 0.5;
          ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  }
}