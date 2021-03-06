import { System } from '@ecs';

import { Circle, Intersecting, Position } from '../components';
import { intersection } from '../utils';

export class IntersectionSystem extends System {

  static queries = {
    entities: { components: [Circle, Position] }
  };

  run() {

    // console.log(`IntersectionSystem`, this, (this as any).executeTime);

    const entities = this.queries.entities.results;

    for (const entity of entities) {
      if (entity.hasComponent(Intersecting)) {
        entity.getMutableComponent(Intersecting).points.length = 0;
      }

      const circle = entity.getComponent(Circle);
      const position = entity.getMutableComponent(Position);

      for (const entityB of entities) {
        const circleB = entityB.getComponent(Circle);
        const positionB = entityB.getMutableComponent(Position);

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
    super.stop();

    // Clean up interesection when stopping
    const entities = this.queries.entities.results;

    for (const entity of entities) {
      if (entity.hasComponent(Intersecting)) {
        entity.getMutableComponent(Intersecting).points.length = 0;
      }
    }
  }
}
