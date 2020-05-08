import { Not, System, SystemStateComponent, World, Entity, SystemData, Read } from '@ecs';

const textarea = document.querySelector('textarea');
function log(msg) {
  console.log(msg);
  textarea.innerHTML += msg + '\n';
}


class Sprite {
  name = 'empty';

  constructor() {
    this.reset();
  }

  reset() {
    this.name = 'empty';
  }
}

class SpriteResources extends SystemStateComponent {
  size = 0;
  memPosition = 0;

  constructor() {
    super();
    this.reset();
  }

  reset() {
    this.size = 0;
    this.memPosition = 0;
  }
}

export class PerformanceCompensation {
  delta: number;
  time: number;

  reset() {
    this.delta = 0;
    this.time = 0;
  }
}

// Systems
@SystemData(
  [Read(Entity), Read(Sprite), Not(SpriteResources)],
  [Read(Entity), Not(Sprite), Read(SpriteResources)],
  [Read(Entity), Read(Sprite), Read(SpriteResources)],
)
class MainSystem implements System {
  run(
    added: [Entity, Sprite][],
    removed: [Entity, SpriteResources],
    normal: [Entity, Sprite, SpriteResources]
  ) {
    for (const [entity] of added) {
      const memPosition = Math.floor(Math.random() * 1000);
      const size = Math.floor(Math.random() * 900) + 100;

      log(`Added SpriteResources component: 'memory position: ${memPosition}, size: ${size}kb' to entity id=${entity.id}`);
      entity.addComponent(SpriteResources, {memPosition, size});
    }

    for (const [entity] of removed) {
      const resources = entity.getComponent(SpriteResources);
      log(`Freeing SpriteResources 'memory position: ${resources.memPosition}, size: ${resources.size}kb'`);
      log(`Removing SpriteResources component from entity id=${entity.id}`);
      entity.removeComponent(SpriteResources);
    }
  }
}

// Initialize our world
const world = new World();

world
  .registerComponent(Sprite)
  .registerComponent(SpriteResources)
  .registerSystem(MainSystem)

const singletonEntity = world.createEntity()
  .addComponent(PerformanceCompensation);

const compensation = singletonEntity.getMutableComponent(PerformanceCompensation);

// HTML Code to interact with the world
document.getElementById('createEntity').addEventListener('click', () => {
  const entity = world.createEntity();
  log(`> Created entity, (id = ${entity.id})`);
});

document.getElementById('addSprite').addEventListener('click', () => {
  const entity = randomEntity();
  if (!entity) return;
  log(`> Adding sprite to entity id=${entity.id}`);
  entity.addComponent(Sprite);
});

document.getElementById('removeSprite').addEventListener('click', () => {
  const entity = randomEntity();
  if (!entity) return;
  log(`> Removing sprite '${entity.getComponent(Sprite).name}' from entity id=${entity.id}`);
  entity.removeComponent(Sprite);
});

document.getElementById('removeSpriteResources').addEventListener('click', () => {
  const entity = randomEntity();
  if (!entity) return;
  log(`> Removing SpriteResources component from entity id=${entity.id}`);
  entity.removeComponent(SpriteResources);
});

document.getElementById('removeEntity').addEventListener('click', () => {
  const entity = randomEntity();
  if (!entity) return;
  log(`> Removing entity id=${entity.id}`);
  entity.remove();
});

// Utils
function randomEntity() {
  return randomFromArray(world.entityManager.entities);
}

function randomFromArray(array) {
  const idx = Math.floor(Math.random() * array.length);
  return array[idx];
}


function animate() {
  compensation.time = performance.now();
  compensation.delta = compensation.time - lastTime;

  world.run();

  lastTime = compensation.time;
  requestAnimationFrame(animate);
}

let lastTime = performance.now();
animate();
