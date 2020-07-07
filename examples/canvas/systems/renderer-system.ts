import { System, SystemData, Read, Entity } from '@ecs';

import { CanvasContext, Circle, Intersecting, Position } from '../components';
import { drawLine, fillCircle } from '../utils';

@SystemData(
  Read(CanvasContext),
)
export class RendererBackground implements System {
  run(canvas: CanvasContext[]) {

    const canvasComponent = canvas[0];

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

  run(components: [Circle, Position][], canvas: CanvasContext[]) {

    const ctx = canvas[0].ctx;

    for (let i = 0; i < components.length; i++) {
      const circle = components[i][0];
      const position = components[i][1];

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

  run(intersects: Intersecting[], canvas: CanvasContext[]) {

    const ctx = canvas[0].ctx;

    for (let i = 0; i < intersects.length; i++) {
      const intersect = intersects[i];

      for (let j = 0; j < intersect.points.length; j++) {
        const points = intersect.points[j];

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff9';

        ctx.fillStyle = 'rgba(255, 255,255, 0.2)';
        fillCircle(ctx, points.xi, points.yi, 8);
        fillCircle(ctx, points.xiPrime, points.yiPrime, 8);

        ctx.fillStyle = '#fff';
        fillCircle(ctx, points.xi, points.yi, 3);
        fillCircle(ctx, points.xiPrime, points.yiPrime, 3);

        drawLine(ctx, points.xi, points.yi, points.xiPrime, points.yiPrime);
      }
    }
  }
}

