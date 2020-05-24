import './index.scss';

import { Read, System, SystemData, World } from '@ecs';
import { Vector2 } from 'examples/utils';

const NUM_ELEMENTS = 600;
const SPEED_MULTIPLIER = 0.1;
const SHAPE_SIZE = 20;
const SHAPE_HALF_SIZE = SHAPE_SIZE / 2;

// Initialize canvas
const canvas = document.querySelector('canvas');
let canvasWidth = canvas.width = window.innerWidth;
let canvasHeight = canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

window.addEventListener( 'resize', () => {
  canvasWidth = canvas.width = window.innerWidth
  canvasHeight = canvas.height = window.innerHeight;
}, false );

// ----------------------
// Components
// ----------------------

// Velocity component
class Velocity extends Vector2 {}

// Position component
class Position extends Vector2 {}

// Shape component
class Shape {
  primitive = 'box';

  reset() {
    this.primitive = 'box';
  }
}

// Renderable component
class Renderable {
  reset() {}
}

class PerformanceCompensation {
  delta = 0;
  time = 0;

  reset() {
    this.delta = this.time = 0;
  }
}

// ----------------------
// Systems
// ----------------------

// MovableSystem
@SystemData(
  // Define a query of entities that have "Velocity" and "Position" components
  [Read(Velocity), Read(Position)],
  Read(PerformanceCompensation),
)
class MovableSystem extends System {

  // This method will get called on every frame by default
  run(movings: [Velocity, Position][], performance: PerformanceCompensation[]) {

    const delta = performance[0].delta;

    // Iterate through all the entities on the query
    for (let i = 0; i < movings.length; i++) {
      const velocity = movings[i][0];
      const position = movings[i][1];

      position.x += velocity.x * delta;
      position.y += velocity.y * delta;

      if (position.x > canvasWidth + SHAPE_HALF_SIZE) { position.x = - SHAPE_HALF_SIZE };
      if (position.x < - SHAPE_HALF_SIZE) { position.x = canvasWidth + SHAPE_HALF_SIZE };
      if (position.y > canvasHeight + SHAPE_HALF_SIZE) { position.y = - SHAPE_HALF_SIZE };
      if (position.y < - SHAPE_HALF_SIZE) { position.y = canvasHeight + SHAPE_HALF_SIZE };
    }
  }
}


// RendererSystem
@SystemData(
  [Read(Position), Read(Shape), Read(Renderable)],
)
class RendererSystem extends System {

  // This method will get called on every frame by default
  run(renderables: [Position, Shape, Renderable][]) {

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // ctx.globalAlpha = 0.6;

    // Iterate through all the entities on the query
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < renderables.length; i++) {
      const position = renderables[i][0];
      const shape = renderables[i][1];

      if (shape.primitive === 'box') {
        this.drawBox(position);
      } else {
        this.drawCircle(position);
      }
    }
  }

  drawCircle(position) {
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(position.x, position.y, SHAPE_HALF_SIZE, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#222';
    ctx.stroke();
  }

  drawBox(position) {
   ctx.beginPath();
    ctx.rect(position.x - SHAPE_HALF_SIZE, position.y - SHAPE_HALF_SIZE, SHAPE_SIZE, SHAPE_SIZE);
    ctx.fillStyle= '#f28d89';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#800904';
    ctx.stroke();
  }
}

// Create world and register the systems on it
const world = new World();
world
  .registerSystem(MovableSystem)
  .registerSystem(RendererSystem);

// Used for singleton components
const singletonEntity = world.createEntity()
    .addComponent(PerformanceCompensation);

// Some helper functions when creating the components
function getRandomVelocity() {
  return {
    x: SPEED_MULTIPLIER * (2 * Math.random() - 1),
    y: SPEED_MULTIPLIER * (2 * Math.random() - 1)
  };
}

function getRandomPosition() {
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight
  };
}

function getRandomShape() {
   return {
     primitive: Math.random() >= 0.5 ? 'circle' : 'box'
   };
}

for (let i = 0; i < NUM_ELEMENTS; i++) {
  world
    .createEntity()
    .addComponent(Velocity, getRandomVelocity())
    .addComponent(Shape, getRandomShape())
    .addComponent(Position, getRandomPosition())
    .addComponent(Renderable)
}

const performanceCompensation = singletonEntity.getMutableComponent(PerformanceCompensation);

// Run!
function run() {
  // Compute delta and elapsed time
  const time = performance.now();
  performanceCompensation.delta = time - lastTime;

  // Run all the systems
  world.run();

  lastTime = time;
  requestAnimationFrame(run);
}

let lastTime = performance.now();
run();