export class BackgroundColor {
  bgColor = 'rgba(17, 17, 19, 1)';
}

export class ParticleProperties {
  color = 'rgba(255, 40, 40, 1)';
  radius = 3;
  count = 60;
  maxVelocity = 0.5;
  life = 6;
}

export class LineProperties {
  length = 150;
  color = [255, 40, 40];
}

export class Particle {
  life: number;

  constructor() {}

  reset() {}
}