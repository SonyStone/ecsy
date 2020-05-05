import { ComponentConstructor } from './component.interface';
import { Entity } from './entity/entity';

export enum Operators {
  Not = 'not',
  Read = 'read',
  Write = 'write',
  Remove = 'remove',
  Change = 'change',
  Add = 'add',
}

export interface OperatorComponent {
  operator: Operators;
  component: ComponentConstructor;
  skipEntity?: (entity: Entity) => boolean;
}

/**
 * Use the Not class to negate a component query.
 */
export const Not = (component: ComponentConstructor): OperatorComponent => ({
  operator: Operators.Not,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  },
});

export const Read = (component: ComponentConstructor): OperatorComponent => ({
  operator: Operators.Read,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return false;
    }

    return true;
  }
})

export const Write = (component: ComponentConstructor): OperatorComponent => ({
  operator: Operators.Write,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  }
})

export const Remove = (component: ComponentConstructor): OperatorComponent => ({
  operator: Operators.Remove,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  }
})

export const Change = (component: ComponentConstructor): OperatorComponent => ({
  operator: Operators.Change,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  }
})

export const Add = (component: ComponentConstructor): OperatorComponent => ({
  operator: Operators.Add,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  }
})