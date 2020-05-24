import { Circle, Position } from './components';
import { Resettable } from 'src/resettable.interface';

export function random(a, b) {
  return Math.random() * (b - a) + a;
}

export class Intersection implements Resettable {
  xi = 0;
  yi = 0;
  xiPrime = 0;
  yiPrime = 0;

  intersect(circleA: Circle, positionA: Position, circleB: Circle, positionB: Position) {
    let a;
    let dx;
    let dy;
    let d;
    let h;
    let rx;
    let ry;
    let x2;
    let y2;

    // dx and dy are the vertical and horizontal distances between the circle centers.
    dx = positionB.x - positionA.x;
    dy = positionB.y - positionA.y;

    // Distance between the centers
    d = Math.sqrt(dy * dy + dx * dx);

    // Check for solvability
    if (d > circleA.radius + circleB.radius) {
      // No solution: circles don't intersect
      return false;
    }
    if (d < Math.abs(circleA.radius - circleB.radius)) {
      // No solution: one circle is contained in the other
      return false;
    }

    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.
     */

    /* Determine the distance from point 0 to point 2. */
    a =
      (circleA.radius * circleA.radius -
        circleB.radius * circleB.radius +
        d * d) /
      (2.0 * d);

    /* Determine the coordinates of point 2. */
    x2 = positionA.x + (dx * a) / d;
    y2 = positionA.y + (dy * a) / d;

    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt(circleA.radius * circleA.radius - a * a);

    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h / d);
    ry = dx * (h / d);

    /* Determine the absolute intersection points. */
    this.xi = x2 + rx;
    this.xiPrime = x2 - rx;
    this.yi = y2 + ry;
    this.yiPrime = y2 - ry;

    return this;
  }

  reset(): void {
    this.xi = this.xiPrime = this.yi = this.yiPrime = 0;
  }
}


export function fillCircle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fill();
}

export function drawLine(ctx, a, b, c, d) {
  ctx.beginPath(), ctx.moveTo(a, b), ctx.lineTo(c, d), ctx.stroke();
}
