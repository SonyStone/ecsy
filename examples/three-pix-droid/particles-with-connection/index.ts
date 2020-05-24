import './index.scss';

import { World } from '@ecs';
import { CanvasContext, CanvasData, CanvasSize, Point, Velocity } from 'examples/utils';

import { BackgroundColor, Life, LineProperties, ParticleProperties } from './components';
import {
  CalculateLifeSystem,
  DrawBackgroundSystem,
  DrawLinesSystem,
  DrawParticlesSystem,
  ParticlesPositionSystem,
} from './systems';


// Setup World

const world = new World();

const canvas = new CanvasData(document.querySelector('canvas'));

const singletonEntity = world.createEntity()
  .addComponent(CanvasSize, canvas.getSize())
  .addComponent(CanvasContext, canvas.getContext())

  .addComponent(ParticleProperties)
  .addComponent(LineProperties)
  .addComponent(BackgroundColor)

const canvasSize = singletonEntity.getComponent(CanvasSize);

canvas.resizeUpdater(canvasSize);

const PARTICLE_LIFE = 6;
const PARTICLE_MAX_VELOCITY = 0.5
const PARTICLE_COUNT = 100;

for(let i = 0; i < PARTICLE_COUNT; i++){
  world.createEntity()
    .addComponent(Point, {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    })
    .addComponent(Velocity, {
      x: Math.random() * (PARTICLE_MAX_VELOCITY * 2) - PARTICLE_MAX_VELOCITY,
      y: Math.random() * (PARTICLE_MAX_VELOCITY * 2) - PARTICLE_MAX_VELOCITY,
    })
    .addComponent(Life, {
      life: Math.random() * PARTICLE_LIFE * 60,
    })
}

world
  .registerSystem(DrawBackgroundSystem)
  .registerSystem(CalculateLifeSystem)
  .registerSystem(ParticlesPositionSystem)
  .registerSystem(DrawParticlesSystem)
  .registerSystem(DrawLinesSystem);

function run() {
  // Run all the systems
  world.run();

  requestAnimationFrame(run);
}

run();