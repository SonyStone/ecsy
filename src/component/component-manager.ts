import { Component, Constructor } from '../component.interface';
import { Pool } from '../pool.interface';
import { ObjectPool } from '../utils/object-pool';
import { DummyObjectPool } from './dummy-object-pool';

export class ComponentManager {
  readonly componentPool = new Map<Constructor<Component>, Pool<Component>>();

  getComponent(componentConstructor: Constructor<Component>): Component {
    const componentsPool = this.getComponentsPool(componentConstructor);

    return componentsPool.aquire();
  }

  registerComponent(componentConstructor: Constructor<Component>): void {
    if (!this.componentPool.has(componentConstructor)) {

      if (componentConstructor.prototype.reset) {

        this.componentPool.set(componentConstructor, new ObjectPool(componentConstructor));

      } else {
        // console.warn(
        //   `Component '${componentConstructor.name}' won't benefit from pooling because 'reset' method was not implemeneted.`
        // );

        this.componentPool.set(componentConstructor, new DummyObjectPool(componentConstructor));
      }
    }
  }

  removeComponent(componentConstructor: Constructor<Component>): void {
    this.componentPool.delete(componentConstructor);
  }

  private getComponentsPool(componentConstructor: Constructor<Component>): Pool<Component> {
    this.registerComponent(componentConstructor);

    return this.componentPool.get(componentConstructor);
  }
}
