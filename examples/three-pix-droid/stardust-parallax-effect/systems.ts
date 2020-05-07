import { Read, System, SystemData } from '@ecs';

import { CanvasContext, CanvasSize } from '../canvas-data';
import { MousePoint } from '../mouse-data';
import { Point } from '../point';
import { Orb, P, PointData, Resize, RingsCount } from './components';

@SystemData(
  [Read(CanvasContext), Read(CanvasSize), Read(Resize)]
)
export class DrawSunBackgroundSystem implements System {
  run([[{ ctx }, { width, height }, resize]]: [CanvasContext, CanvasSize, Resize][]) {

    const bgColor = ctx.createRadialGradient(resize.x, resize.y, 0, resize.x, resize.y, resize.x)
      bgColor.addColorStop(0, `rgb(255, 255, 255)`)
      bgColor.addColorStop(.15, `rgb(255, 255, 255)`)
      bgColor.addColorStop(.16, `rgb(255, 200, 0)`)
      bgColor.addColorStop(.23, `rgb(255, 0, 0)`)
      bgColor.addColorStop(.45, `rgb(255, 0, 25)`)
      bgColor.addColorStop(.85, `rgb(9, 9, 25)`)
      bgColor.addColorStop(1, `rgb(0, 0, 20)`);

    ctx.globalCompositeOperation = `normal`;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }
}

@SystemData(
  [Read(CanvasSize), Read(P), Read(Resize)]
)
export class CenterUpdateSystem implements System {
  run([[canvas, place, resize]]: [CanvasSize, P, Resize][]) {
    resize.x = canvas.width * 0.5;
    resize.y = canvas.height * 0.5;
    place.height = resize.y * 0.4;
    place.width = resize.x * 0.4;
  }
}

@SystemData(
  [Read(Orb), Read(Point), Read(PointData)],
  [Read(P), Read(MousePoint), Read(CanvasSize), Read(Resize), Read(RingsCount)]
)
export class OrbPointSystem implements System {
  run(
    particles: [Orb, Point, PointData][],
    [[place, mouse, canvas, resize, { ringsCount }]]: [P, MousePoint, CanvasSize, Resize, RingsCount][],
  ) {
    for (const [orb, point, data] of particles) {
      const radius = orb.radius * place.height / ringsCount;
      data.impact = radius / place.height;
      data.velocity = orb.velocity + data.impact

      const radian = orb.angle * Math.PI  / 180;

      data.cos = Math.cos(radian);
      data.sin = Math.sin(radian);

      const offsetX = data.cos * place.width * data.impact;
      const offsetY = data.sin * place.width * data.impact;

      const paralaxX = mouse.x / canvas.width * 2 - 1;
      const paralaxY = mouse.y / canvas.height;

      point.x = resize.x + data.cos * (place.height + radius) + offsetX;
      point.y = resize.y + data.sin * (place.height + radius) - offsetY * paralaxY - paralaxX * offsetX;
    }
  }
}

@SystemData(
  [Read(Orb), Read(Point), Read(PointData)],
  [Read(MousePoint), Read(Resize)]
)
export class RefreshSystem implements System {
  run(
    particles: [Orb, Point, PointData][],
    [[mouse, resize]]: [MousePoint, Resize][],
  ) {
    for (const [orb, point, data] of particles) {
      data.distToC = Math.hypot(point.x - resize.x, point.y - resize.y);
      data.distToM = Math.hypot(point.x - mouse.x, point.y - mouse.y);

      const optic = data.sin * orb.size * data.impact * .7;
      const mEffect = data.distToM <= 50 ? (1 - data.distToM / 50) * 25 : 0;
      data.size = orb.size + optic + mEffect;

      orb.angle = (orb.angle - data.velocity) % 360;
    }
  }
}

@SystemData(
  [Read(Orb), Read(Point), Read(PointData)],
  [Read(CanvasContext), Read(P)]
)
export class DrawOrbsSystem implements System {
  run(
    particles: [Orb, Point, PointData][],
    [[{ ctx }, place]]: [CanvasContext, P][],
  ) {
    ctx.globalCompositeOperation = `lighter`;

    for (const [orb, point, data] of particles) {

      const h = orb.angle;
      const s = 100;
      const l = (1 - Math.sin(data.impact * Math.PI)) * 90 + 10;
      const color = `hsl(${h}, ${s}%, ${l}%)`;

      if (data.distToC > place.height - 1 || data.sin > 0) {
        ctx.strokeStyle = ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, data.size, 0, 2 * Math.PI);
        data.distToM <= 50
          ? ctx.stroke()
          : ctx.fill();
      }
    }
  }
}
