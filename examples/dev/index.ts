import './index.scss';

import { Read, World } from '@ecs';
import { Not } from 'src/data';
import { System, SystemData } from 'src/system';

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

class Vector2 {
  x = 0;
  y = 0;

  reset() {
    this.x = this.y = 0;
  }
}

// Velocity component
class Velocity extends Vector2 {}

// Position component
class Position extends Vector2 {}

// Position component
class Acceleration extends Vector2 {}

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
  Read(PerformanceCompensation),
  [Read(Position), Read(Velocity), Not(Acceleration)],
)
class MovableSystem implements System {

  // This method will get called on every frame by default
  run(performance: PerformanceCompensation[], entities: any[]) {

    console.log(`run MovableSystem`, performance, entities);
  }
}

@SystemData(
  [Read(Position), Read(Velocity), Not(Acceleration)],
)
class SystemTest implements System {
  run(entities: any[]) {
    console.log(`run SystemTest`, entities);
  }
}

// Create world and register the systems on it
const world = new World();

// world
  // .registerSystem(MovableSystem)



// world.createEntity()
//   .addComponent(PerformanceCompensation);

const entity = world.createEntity()
  // .addComponent(Velocity)

entity.addComponent(Position)
entity.addComponent(Velocity)

world
  .registerSystem(SystemTest);

// world.createEntity()
//   .addComponent(Velocity)
//   .addComponent(Position)


// world.createEntity()
//   .addComponent(Velocity)
//   .addComponent(Position)
//   .addComponent(Acceleration)

// world.createEntity()
//   .addComponent(Position)
//   .addComponent(Acceleration)

// entity.addComponent(Acceleration)


const queries = world.systemManager.getSystems().get(SystemTest).queries;
console.log(`queries`, queries);

// Run!
function run() {
  // Compute delta and elapsed time
  const time = performance.now();

  // Run all the systems
  world.run();

  lastTime = time;
  // requestAnimationFrame(run);
}

let lastTime = performance.now();
run();

console.log(`world`, world);