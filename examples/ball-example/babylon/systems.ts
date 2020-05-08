import { Entity, Read, System, SystemData, Not } from '@ecs';

import {
  Collider,
  Colliding,
  Collisionable,
  Object3D,
  PerformanceCompensation,
  PulsatingColor,
  PulsatingScale,
  Recovering,
  Rotating,
  Timeout,
} from './components';

declare var BABYLON: any;

@SystemData(
  [Read(Rotating), Read(Object3D), Not(PulsatingColor)],
  Read(PerformanceCompensation),
)
export class RotatingSystem implements System {
  run(entities: [Rotating, Object3D][], [{ delta }]: PerformanceCompensation[]) {

    // console.log(`entities`, entities);

    for (const [{ rotatingSpeed }, { object }] of entities) {
      object.rotation.x += rotatingSpeed * delta;
      object.rotation.y += rotatingSpeed * delta * 2;
      object.rotation.z += rotatingSpeed * delta * 3;
    }
  }
}


const TIMER_TIME = 1;

@SystemData(
  [Read(Entity), Read(PulsatingColor), Read(Object3D)],
  Read(PerformanceCompensation),
)
export class PulsatingColorSystem implements System {
  run(entities: [Entity, PulsatingColor, Object3D][], [{ time }]: PerformanceCompensation[]) {

    time *= 1000;

    for (const [entity, { offset }, { object }] of entities) {
      if (entity.hasComponent(Colliding)) {
        object.instancedBuffers.color.set(1, 1, 0, 1);
      } else if (entity.hasComponent(Recovering)) {
        const col = 0.3 + entity.getComponent(Timeout).timer / TIMER_TIME;
        object.instancedBuffers.color.set(col, col, 0, 1);
      } else {
        const r =
          Math.sin(
            time / 500 + offset * 12
          ) /
            2 +
          0.5;
        object.instancedBuffers.color.set(r, 0, 0, 1);
      }
    }
  }
}


@SystemData(
  [Read(Entity), Read(PulsatingScale)],
  Read(PerformanceCompensation),
)
export class PulsatingScaleSystem extends System {
  run(entities: [Entity, PulsatingScale][], [{ time }]: PerformanceCompensation[]) {
    for (const [entity, { offset }] of entities) {
      const object = entity.getComponent(Object3D).object;

      let mul;
      if (entity.hasComponent(Colliding)) {
        mul = 2;
      } else if (entity.hasComponent(Recovering)) {
        mul = 1.2;
      } else {
        mul = 0.8;
      }

      const sca = mul * (Math.cos(time + offset) / 2 + 1) + 0.2;
      object.scaling.set(sca, sca, sca);
    }
  }
}

@SystemData(
  [Read(Object3D), Read(PulsatingScale)],
  Read(PerformanceCompensation),
)
export class MovingSystem extends System {
  run(entities: [Object3D, PulsatingScale][], [{ time }]: PerformanceCompensation[]) {
    for (const [{ object }, { offset }] of entities) {
      const radius = 5;
      const maxRadius = 5;
      object.position.z = Math.cos(time + 3 * offset) * maxRadius + radius;
    }
  }
}

@SystemData(
  [Read(Entity), Read(Timeout)],
  Read(PerformanceCompensation),
)
export class TimeoutSystem implements System {
  run(entities: [Entity, Timeout][], [{ delta }]: PerformanceCompensation[]) {
    for (const [entity, timeout] of entities) {

      timeout.timer -= delta;
      if (timeout.timer < 0) {
        timeout.timer = 0;
        timeout.addComponents.forEach(componentName => {
          entity.addComponent(componentName);
        });
        timeout.removeComponents.forEach(componentName => {
          entity.removeComponent(componentName);
        });

        entity.removeComponent(Timeout);
      }
    }
  }
}

@SystemData(
  [Read(Entity), Read(Object3D), Read(Collisionable)],
  [Read(Object3D), Read(Collider)],
)
export class ColliderSystem implements System {
  run(boxes: [Entity, Object3D, Collisionable][], balls: [Object3D, Collider][]) {
    for (const [{ object: ballObject }] of balls) {
      for (const [entity, { object: boxObject }] of boxes) {
        const prevColliding = entity.hasComponent(Colliding);
        if (
          BABYLON.BoundingSphere.Intersects(
            ballObject.getBoundingInfo().boundingSphere,
            boxObject.getBoundingInfo().boundingSphere
          )
        ) {
          if (!prevColliding) {
            entity.addComponent(Colliding);
          }
        } else {
          if (prevColliding) {
            entity.removeComponent(Colliding);
            entity.addComponent(Recovering);
            entity.addComponent(Timeout, {
              timer: TIMER_TIME,
              removeComponents: [Recovering]
            });
          }
        }
      }
    }
  }
}

