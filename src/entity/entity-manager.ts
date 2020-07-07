import { ComponentManager } from '../component';
import { Component, Constructor } from '../component.interface';
import { QueryManager } from '../query';
import { getName } from '../utils';
import { ObjectPool } from '../utils/object-pool';
import { Entity } from './entity';
import { SystemStateComponent } from './system-state-component';

// tslint:disable:no-bitwise

const setComponentValues = (component: Component, values: { [key: string]: any }) => {
  if (component.copy) {
    component.copy(values);
  } else {
    for (const name in values) {
      if (values.hasOwnProperty(name)) {
        component[name] = values[name];
      }
    }
  }
}

/**
 * EntityManager
 */
export class EntityManager {

  // All the entities in this instance
  entities: Entity[] = [];

  entityPool = new ObjectPool<Entity>(Entity);

  // Deferred deletion
  entitiesWithComponentsToRemove = new Set<Entity>();
  entitiesToRemove: Entity[] = [];
  deferredRemovalEnabled = true;

  constructor(
    private componentManager: ComponentManager,
    private queryManager: QueryManager,
  ) {}

  /**
   * Create a new entity
   */
  createEntity(): Entity {
    const entity = this.entityPool.aquire();

    entity.alive = true;
    entity.entityManager = this;

    this.entities.push(entity);

    return entity;
  }

  // COMPONENTS

  /**
   * Add a component to an entity
   * @param entity Entity where the component will be added
   * @param componentConstructor Component to be added to the entity
   * @param values Optional values to replace the default attributes
   */
  entityAddComponent(entity: Entity, componentConstructor: Constructor<Component>, values?: { [key: string]: any }): void {
    if (entity.componentTypes.has(componentConstructor)) {
      return;
    }

    entity.componentTypes.add(componentConstructor);

    const component = this.componentManager.getComponent(componentConstructor);

    if (values) {
      setComponentValues(component, values)
    }

    entity.components.set(componentConstructor.name, component);

    this.queryManager.onEntityComponentUpdated(entity, componentConstructor);
  }

  /**
   * Remove a component from an entity
   * @param entity Entity which will get removed the component
   * @param componentConstructor Component to remove from the entity
   * @param immediately If you want to remove the component immediately instead of deferred (Default is false)
   */
  entityRemoveComponent(entity: Entity, componentConstructor: Constructor<Component>, immediately?: boolean): void {
    if (!entity.componentTypes.has(componentConstructor)) {

      return;
    }

    if (immediately) {

      this.entityRemoveComponentSync(entity, componentConstructor);

    } else {

      if (entity.componentTypesToRemove.size === 0) {
        this.entitiesWithComponentsToRemove.add(entity);
      }

      entity.componentTypes.delete(componentConstructor);
      entity.componentTypesToRemove.add(componentConstructor);

      const componentName = getName(componentConstructor);
      entity.componentsToRemove.set(componentName, entity.components.get(componentName));

      entity.components.delete(componentName);

    }

    // Check each indexed query to see if we need to remove it
    this.queryManager.onEntityComponentUpdated(entity, componentConstructor);
  }

  entityRemoveComponentSync(entity: Entity, componentConstructor: Constructor<Component>): void {
    // Remove T listing on entity and property ref, then free the component.
    entity.componentTypes.delete(componentConstructor);
    const componentName = getName(componentConstructor);
    const componentEntity = entity.components.get(componentName);
    entity.components.delete(componentName);

    this.componentManager.componentPool.get(componentConstructor).release(componentEntity);
  }

  /**
   * Remove all the components from an entity
   * @param entity Entity from which the components will be removed
   */
  entityRemoveAllComponents(entity: Entity, immediately?: boolean): void {
    for (const componentType of entity.componentTypes) {
      if ((componentType as any).__proto__ !== SystemStateComponent) {
        this.entityRemoveComponent(entity, componentType, immediately);
      }
    }
  }

  /**
   * Remove the entity from this manager. It will clear also its components
   * @param entity Entity to remove from the manager
   * @param immediately If you want to remove the component immediately instead of deferred (Default is false)
   */
  removeEntity(entity: Entity, immediately?: boolean): void {
    const index = this.entities.indexOf(entity);

    if (!~index) { throw new Error('Tried to remove entity not in list'); }

    entity.alive = false;

    this.entityRemoveAllComponents(entity, immediately);
  }

  private releaseEntity(entity: Entity, index): void {
    this.entities.splice(index, 1);

    // Prevent any access and free
    entity.entityManager = null;
    this.entityPool.release(entity);
  }

  /**
   * Remove all entities from this manager
   */
  removeAllEntities(): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      this.removeEntity(this.entities[i]);
    }
  }

  processDeferredRemoval(): void {
    if (!this.deferredRemovalEnabled) {
      return;
    }

    for (const entity of this.entitiesToRemove) {
      const index = this.entities.indexOf(entity);
      this.releaseEntity(entity, index);
    }

    this.entitiesToRemove.length = 0;

    for (const entity of this.entitiesWithComponentsToRemove) {
      for (const componentTypeToRemove of entity.componentTypesToRemove) {

        const componentName = getName(componentTypeToRemove);

        const component = entity.componentsToRemove.get(componentName);
        entity.componentsToRemove.delete(componentName);

        this.componentManager.componentPool.get(componentTypeToRemove).release(component);
      }

      entity.componentTypesToRemove.clear();
    }

    this.entitiesWithComponentsToRemove.clear();
  }

  // EXTRAS

  /**
   * Return number of entities
   */
  count(): number {
    return this.entities.length;
  }

  /**
   * Return some stats
   */
  stats() {
    const stats = {
      numEntities: this.entities.length,
      numQueries: this.queryManager.queries.size,
      queries: this.queryManager.stats(),
      numComponentPool: Object.keys(this.componentManager.componentPool)
        .length,
      componentPool: {},
    };

    for (const [cname, _] of this.componentManager.componentPool) {

      const pool = this.componentManager.componentPool.get(cname);
      stats.componentPool[cname.name] = {
        used: pool.totalUsed(),
        size: pool.count
      };

    }

    return stats;
  }
}

