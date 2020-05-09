import { Component, Constructor } from '../component.interface';
import { OperatorComponents } from '../data';
import { queryKey } from '../utils';
import { Entity } from '../entity';
import { Query } from './query';

// tslint:disable:no-bitwise

/**
 * QueryManager
 */
export class QueryManager {
  // Queries indexed by a unique identifier for the components it has
  queries = new Map<string, Query>();

  /**
   * Get a query for the specified components
   * @param operatorComponents Components that the query should have
   */
  getQuery(operatorComponents: OperatorComponents, entities: Entity[]): Query {
    const key = queryKey(operatorComponents);

    let query = this.queries.get(key);

    if (!query) {
      query = new Query(operatorComponents, entities, key);

      this.queries.set(key, query);
    }

    return query;
  }

  /**
   * Callback when a component is added to an entity
   * @param entity Entity that just got the new component
   * @param componentConstructor Component added to the entity
   */
  onEntityComponentAdded(entity: Entity, componentConstructor: Constructor<Component>): void {
    // Check each indexed query to see if we need to add this entity to the list
    for (const [_, query] of this.queries) {
      query.addEntityComponent(entity, componentConstructor);
    }
  }

  /**
   * Callback when a component is removed from an entity
   * @param entity Entity to remove the component from
   * @param componentConstructor Component to remove from the entity
   */
  onEntityComponentRemoved(entity: Entity, componentConstructor: Constructor<Component>): void {
    for (const [_, query] of this.queries) {

      // if ( // not
      //   !!~query.componentConstructors.indexOf(componentConstructor) &&
      //   !~query.entities.indexOf(entity) &&
      //   query.match(entity)
      // ) {
      //   query.addEntity(entity);
      //   continue;
      // }

      // if (
      //   query.componentConstructors.has(componentConstructor) &&
      //   query.entities.has(entity) &&
      //   !query.match(entity)
      // ) {
      //   query.removeEntity(entity);
      //   continue;
      // }

    }
  }



  /**
   * Return some stats from this class
   */
  stats(): { [key: string]: Query; } {
    const stats = {};
    for (const [queryName, query] of this.queries) {

      stats[queryName] = query.stats();
    }

    return stats;
  }
}
