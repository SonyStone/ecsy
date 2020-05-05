import './index.scss';

import { System, World, SystemData, Read } from '@ecs';

import { random } from './random';
import { Vector2 } from './math';
import { draw } from './create-circle';

const config = {
  dotMinRad: 6,
  dotMaxRad: 20,
  sphereRad: 350,
  bigDotRad: 35,
  mouseSize: 120,
  massFactor: 0.002,
  defColor: `rgba(250, 10, 30, 0.9)`,
  smooth: 0.85,
}

// Initialize canvas
const canvas = document.querySelector('canvas');
let canvasWidth = canvas.width = window.innerWidth;
let canvasHeight = canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

window.addEventListener( 'resize', () => {
  canvasWidth = canvas.width = window.innerWidth
  canvasHeight = canvas.height = window.innerHeight;
}, false );

const gMouse = { x: 0, y: 0 };
let gDown;
function isDown() {
  gDown = !gDown;
}

canvas.addEventListener(`mousemove`, ({ x, y }) => {
  [gMouse.x, gMouse.y] = [x, y];
});
window.addEventListener(`mousedown`, isDown);
window.addEventListener(`mouseup`  , isDown);



// ----------------------
// Components
// ----------------------

// Velocity component
class Dot {
  pos = {x: 0, y: 0}
  vel = {x: 0, y: 0}
  rad = random(config.dotMinRad, config.dotMaxRad);
  mass = this.rad * config.massFactor;
  color = config.defColor;

  reset() {}
}

class MousePosition extends Vector2 {}

class MouseClick {
  down: boolean;
}

class PerformanceСompensation {
  delta = 0;
  time = 0;

  reset() {
    this.delta = this.time = 0;
  }
}

// ----------------------
// Systems
// ----------------------

// UpdateDotsSystem
@SystemData(
  Read(Dot),
  Read(PerformanceСompensation),
)
class UpdateDotsSystem implements System {
  // This method will get called on every frame by default
  run(dots: Dot[]) {

    // Iterate through all the entities on the query
    for (let i = 1; i < dots.length; i++) {
      const acc = {x: 0, y: 0};
      const dotA = dots[i];

      for (let j = 0; j < dots.length; j++) {
        if (i === j) {
          continue;
        }

        const dotB = dots[j];

        const delta = {x: dotB.pos.x - dotA.pos.x, y: dotB.pos.y - dotA.pos.y}
        const dist = Math.sqrt( delta.x * delta.x + delta.y * delta.y) || 1;
        let force  = (dist - config.sphereRad) / dist * dotB.mass;

        if (j === 0) {
          const alpha = config.mouseSize / dist;
          dotA.color = `rgba(250, 10, 30, ${alpha})`;

          dist < config.mouseSize
            ? force = (dist - config.mouseSize) * dotB.mass
            : force = dotA.mass;
        }

        acc.x += delta.x * force;
        acc.y += delta.y * force;
      }

      dotA.vel.x = dotA.vel.x * config.smooth + acc.x * dotA.mass;
      dotA.vel.y = dotA.vel.y * config.smooth + acc.y * dotA.mass;
    }

  }
}

@SystemData(
  Read(MouseClick),
  Read(MousePosition),
)
class AddDotsSystem implements System {
  run([mouseClick]: MouseClick[], [mouse]: MousePosition[]) {
    const down = mouseClick.down;

    if (down) {
      world.createEntity()
        .addComponent(Dot, { pos: { x: mouse.x, y: mouse.y } })
    }
  }
}

@SystemData(
  Read(MouseClick),
)
class UpadateMouseClickSystem implements System {
  run([mouse]: MouseClick[]) {
    mouse.down = gDown;
  }
}

@SystemData(
  Read(MousePosition),
)
class UpadateMousePositionSystem implements System {
  run([mouse]: MousePosition[]) {
    [mouse.x, mouse.y] = [gMouse.x, gMouse.y];
  }
}

@SystemData(
  Read(MousePosition),
)
export class RendererBackground implements System {
  run() {
    ctx.fillStyle = 'rgb(21, 25, 46)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

@SystemData(
  Read(Dot),
  Read(MousePosition),
)
class RendererDotsSystem implements System {

  createCircle = draw(ctx).createCircle;

  run(dots: Dot[], [mouse]: MousePosition[]) {

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];

      if (i === 0) {
        dot.pos.x = mouse.x;
        dot.pos.y = mouse.y;
      } else {
        dot.pos.x = dot.pos.x + dot.vel.x;
        dot.pos.y = dot.pos.y + dot.vel.y;
      }

      this.createCircle(dot.pos.x, dot.pos.y, dot.rad, true, dot.color);
      this.createCircle(dot.pos.x, dot.pos.y, dot.rad, false, config.defColor);
    }
  }
}


// Create world and register the systems on it
const world = new World();

// Used for singleton components
const singletonEntity = world.createEntity()
  .addComponent(PerformanceСompensation)
  .addComponent(MouseClick)
  .addComponent(MousePosition, { x: gMouse.x, y: gMouse.y });


world.createEntity()
  .addComponent(Dot, { rad: config.bigDotRad })

world
  .registerSystem(UpadateMousePositionSystem)
  .registerSystem(UpadateMouseClickSystem)
  .registerSystem(AddDotsSystem)
  .registerSystem(UpdateDotsSystem)
  .registerSystem(RendererBackground)
  .registerSystem(RendererDotsSystem);

const performanceСompensation = singletonEntity.getMutableComponent(PerformanceСompensation);

console.log(world);
// Run!
function run() {
  // Compute delta and elapsed time
  const time = performance.now();
  performanceСompensation.delta = time - lastTime;

  // Run all the systems
  world.run();

  lastTime = time;
  requestAnimationFrame(run);
}

let lastTime = performance.now();
run();