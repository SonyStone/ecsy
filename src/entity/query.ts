import { Component, ComponentConstructor } from '../component.interface';
import { OperatorComponent, Operators } from '../data';
import { some } from '../utils';
import { Entity } from './entity';

// tslint:disable:no-bitwise

export class Query {

  components: Component[] | Component[][];
  private isChanged: boolean;

  private componentConstructors: Map<ComponentConstructor, OperatorComponent>;

  private entities = new Set<Entity>();

  /**
   * @param operatorComponents List of types of components to query
   */
  constructor(
    operatorComponents: OperatorComponent[] | OperatorComponent,
    entities: Entity[],
    public key: string,
  ) {

    // Fill the query with the existing entities
    for (const entity of entities) {
      const isAddEntity = !some(operatorComponents)(({skipEntity}) => skipEntity(entity));

      if (isAddEntity) {
        this.addEntity(entity);
      }
    }

    this.componentConstructors = new Map(initComponentConstructorsMap(operatorComponents));

    this.isChanged = true;
  }

  /**
   * Add the entity only if:
   * Component is in the query
   * and Entity has ALL the components of the query
   * and Entity is not already in the query
   */
  addEntityComponent(entity: Entity, componentConstructor: ComponentConstructor): void {
    const operatorComponent = this.componentConstructors.get(componentConstructor);

    if (!operatorComponent) {
      return;
    }

    const isAddEntity = !some(operatorComponent)(({skipEntity}) => skipEntity(entity));

    if (isAddEntity) {
      this.addEntity(entity);
    } else {
      this.removeEntity(entity);
    }

    this.isChanged = true;
  }

  prepareComponents(): void {
    if (this.isChanged) {
      this.components = initComponents(this.componentConstructors, this.entities);
      this.isChanged = false;
    }
  }

  /**
   * Add entity to this query
   */
  private addEntity(entity: Entity) {
    entity.queries.add(this);
    this.entities.add(entity);
  }

  /**
   * Remove entity from this query
   */
  private removeEntity(entity: Entity) {
    entity.queries.delete(this);
    this.entities.delete(entity);
  }

  /**
   * Return stats for this query
   */
  stats() {
    return {
      numComponents: this.componentConstructors.size,
      numEntities: this.entities.size
    };
  }
}

const initComponents = (componentConstructors: Map<ComponentConstructor, OperatorComponent>, entities: Set<Entity>): Component[] => {
  const components = [];

  for (const entity of entities) {
    const temp = [];
    for (const [componentConstructor, operatorComponent] of componentConstructors) {
      if (operatorComponent.operator === Operators.Not) {
        continue;
      }

      const component = entity.getComponent(componentConstructor);
      if (component) {
        temp.push(component);
      }
    }

    if (temp.length === 1) {
      components.push(temp[0]);
    } else {
      components.push(temp);
    }
  }

  return components;
}


const initComponentConstructorsMap =
  (componentConstructors: OperatorComponent[] | OperatorComponent): [ComponentConstructor, OperatorComponent][] =>
    (Array.isArray(componentConstructors))
      ? componentConstructors.map((componentConstructor) => [componentConstructor.component, componentConstructor])
      : [[componentConstructors.component, componentConstructors]];
