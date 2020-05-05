import { Component, ComponentConstructor } from '../component.interface';
import { ObjectPool } from '../utils/object-pool';
import { Pool } from '../pool.interface';
import { DummyObjectPool } from './dummy-object-pool';

export class ComponentManager {
  readonly componentPool = new Map<ComponentConstructor, Pool<Component>>();

  getComponent(componentConstructor: ComponentConstructor): Component {
    const componentsPool = this.getComponentsPool(componentConstructor);

    return componentsPool.aquire();
  }

  registerComponent(componentConstructor: ComponentConstructor): void {
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

  removeComponent(componentConstructor: ComponentConstructor): void {
    this.componentPool.delete(componentConstructor);
  }

  private getComponentsPool(componentConstructor: ComponentConstructor): Pool<Component> {
    this.registerComponent(componentConstructor);

    return this.componentPool.get(componentConstructor);
  }
}
