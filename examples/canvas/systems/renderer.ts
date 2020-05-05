import { System, SystemData, Read } from '@ecs';

import { CanvasContext, Circle, Intersecting, Position } from '../components';
import { drawLine, fillCircle } from '../utils';

@SystemData(
  Read(CanvasContext),
)
export class RendererBackground implements System {
  run([canvasComponent]: CanvasContext[]) {

    const ctx: CanvasRenderingContext2D = canvasComponent.ctx;
    const canvasWidth = canvasComponent.width;
    const canvasHeight = canvasComponent.height;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

@SystemData(
  [Read(Circle), Read(Position)],
  Read(CanvasContext),
)
export class RendererCircles implements System {

  run(components: [Circle, Position][], [{ ctx }]: CanvasContext[]) {

    for (const [circle, position] of components) {
      ctx.beginPath();
      ctx.arc(
        position.x,
        position.y,
        circle.radius,
        0,
        2 * Math.PI,
        false
      );
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }
  }
}

@SystemData(
  Read(Intersecting),
  Read(CanvasContext),
)
export class RendererIntersecting implements System {

  run(intersects: Intersecting[], [{ ctx }]: CanvasContext[]) {

    for (const intersect of intersects) {

      for (const points of intersect.points) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff9';

        ctx.fillStyle = 'rgba(255, 255,255, 0.2)';
        fillCircle(ctx, points[0], points[1], 8);
        fillCircle(ctx, points[2], points[3], 8);

        ctx.fillStyle = '#fff';
        fillCircle(ctx, points[0], points[1], 3);
        fillCircle(ctx, points[2], points[3], 3);

        drawLine(ctx, points[0], points[1], points[2], points[3]);
      }
    }
  }
}
