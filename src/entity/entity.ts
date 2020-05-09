import { Component, Constructor } from '../component.interface';
import { Query } from '../query';
import { EntityManager } from './entity-manager';

// tslint:disable:no-bitwise

let nextId = 0;

export class Entity implements Component {
  // Unique ID for this entity
  id = nextId++;

  // List of components types the entity has
  componentTypes = new Set<Constructor<Component>>();

  // Instance of the components
  components = new Map<string, Component>();

  componentsToRemove = new Map<string, Component>();

  // Queries where the entity is added
  queries = new Set<Query>();

  // Used for deferred removal
  componentTypesToRemove = new Set<Constructor<Component>>();

  alive = false;

  constructor(
    public entityManager: EntityManager,
  ) {}

  // COMPONENTS

  addComponent(componentConstructor: Constructor<Component>, values?: { [key: string]: any }): this {
    this.entityManager.entityAddComponent(this, componentConstructor, values);

    return this;
  }

  getComponent<T>(componentConstructor: Constructor<T>, includeRemoved?: boolean): T {
    let component = this.components.get(componentConstructor.name) as T;

    if (!component && includeRemoved === true) {
      component = this.componentsToRemove.get(componentConstructor.name) as T;
    }

    return component;
  }

  getMutableComponent<T>(componentConstructor: Constructor<T> ): T {
    const component = this.components.get(componentConstructor.name) as T;

    return component;
  }

  /**
   * Once a component is removed from an entity, it is possible to access its contents
   */
  getRemovedComponent(componentConstructor: Constructor<Component>): Component {
    return this.componentsToRemove.get(componentConstructor.name);
  }

  getComponents(): Map<string, Component> {
    return this.components;
  }

  getComponentsToRemove(): Map<string, Component> {
    return this.componentsToRemove;
  }

  getComponentTypes(): Set<Constructor<Component>> {
    return this.componentTypes;
  }


  /**
   * This will mark the component to be removed and will populate all the queues from the
   * systems that are listening to that event, but the component itself won't be disposed
   * until the end of the frame, we call it deferred removal. This is done so systems that
   * need to react to it can still access the data of the components.
   */
  removeComponent(componentConstructor: Constructor<Component>, forceRemove?: boolean): this {
    this.entityManager.entityRemoveComponent(this, componentConstructor, forceRemove);

    return this;
  }

  hasComponent(componentConstructor: Constructor<Component>, includeRemoved?: boolean): boolean {
    return (
      this.componentTypes.has(componentConstructor) ||
      (includeRemoved === true && this.hasRemovedComponent(componentConstructor))
    );
  }

  hasRemovedComponent(componentConstructor: Constructor<Component>): boolean {
    return this.componentTypesToRemove.has(componentConstructor);
  }

  hasAllComponents(componentConstructors: Map<Constructor<Component>, any>): boolean {
    for (const [component] of componentConstructors) {
      if (!this.hasComponent(component)) { return false; }
    }

    return true;
  }

  hasAnyComponents(componentConstructors: Constructor<Component>[]): boolean {
    for (const component of componentConstructors) {
      if (this.hasComponent(component)) { return true; }
    }

    return false;
  }

  removeAllComponents(forceRemove?: boolean) {
    return this.entityManager.entityRemoveAllComponents(this, forceRemove);
  }

  // EXTRAS

  // Initialize the entity. To be used when returning an entity to the pool
  reset() {
    this.id = nextId++;
    this.entityManager = null;
    this.componentTypes.clear();
    this.queries.clear();
    this.components.clear();
  }

  remove(forceRemove?: boolean) {
    return this.entityManager.removeEntity(this, forceRemove);
  }
}
