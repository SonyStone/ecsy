import { Vector2 } from 'examples/utils';

export class Resize extends Vector2 {}

export class P {
  height = 0;
  width = 0;
}

export class Orb {
  size: number;
  angle: number;
  radius: number;
  velocity: number;
}

export class PointData {
  cos: number;
  sin: number;
  impact: number;
  velocity: number;
  size: number;
  distToC: number;
  distToM: number;
}

export class RingsCount {
  ringsCount: number;
}