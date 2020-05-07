import { Component, Constructor } from './component.interface';
import { Entity } from './entity/entity';

export enum Operators {
  Not = 'not',
  Read = 'read',
  Write = 'write',
  Remove = 'remove',
  Change = 'change',
  Add = 'add',
}

export type OperatorComponents = OperatorComponent | OperatorComponent[];

export interface OperatorComponent {
  operator: Operators;
  component: Constructor<Component>;
  skipEntity?: (entity: Entity) => boolean;
}

/**
 * Use the Not class to negate a component query.
 */
export const Not = (component: Constructor<Component>): OperatorComponent => ({
  operator: Operators.Not,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  },
});

export const Read = (component: Constructor<Component>): OperatorComponent => ({
  operator: Operators.Read,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return false;
    }

    return true;
  }
})

export const Write = (component: Constructor<Component>): OperatorComponent => ({
  operator: Operators.Write,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  }
})

export const Remove = (component: Constructor<Component>): OperatorComponent => ({
  operator: Operators.Remove,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  }
})

export const Change = (component: Constructor<Component>): OperatorComponent => ({
  operator: Operators.Change,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  }
})

export const Add = (component: Constructor<Component>): OperatorComponent => ({
  operator: Operators.Add,
  component,
  skipEntity: (entity: Entity) => {
    if (entity.hasComponent(component)) {
      return true;
    }

    return false;
  }
})