import { System, SystemData, Read, Entity } from '@ecs';

import { Circle, Intersecting, Position } from '../components';
import { intersection } from '../utils';

@SystemData(
  [Read(Circle), Read(Position), Read(Entity)]
)
export class IntersectionSystem implements System {

  run(entities: [Circle, Position, Entity][]) {

    // console.log(`IntersectionSystem`, this, (this as any).executeTime);

    for (const [circle, position, entity] of entities) {
      if (entity.hasComponent(Intersecting)) {
        entity.getMutableComponent(Intersecting).points.length = 0;
      }

      for (const [circleB, positionB] of entities) {
        const intersect = intersection(circle, position, circleB, positionB);

        if (intersect !== false) {
          let intersectComponent;
          if (!entity.hasComponent(Intersecting)) {
            entity.addComponent(Intersecting);
          }
          intersectComponent = entity.getMutableComponent(Intersecting);
          intersectComponent.points.push(intersect);
        }
      }
      if (
        entity.hasComponent(Intersecting) &&
        entity.getComponent(Intersecting).points.length === 0
      ) {
        entity.removeComponent(Intersecting);
      }
    }
  }

  stop() {
    // super.stop();

    // Clean up interesection when stopping
    // const entities = this.queries.entities.results;

    // for (const entity of entities) {
    //   if (entity.hasComponent(Intersecting)) {
    //     entity.getMutableComponent(Intersecting).points.length = 0;
    //   }
    // }
  }
}
