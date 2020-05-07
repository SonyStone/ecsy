import { OperatorComponent } from '../data';
import { Entity } from '../entity';
import { Query } from '../entity/query';

export interface ResultQuery {
  [key: string]: {
    /**
     * All the entities with selected component
     */
    results: Entity[];
    /**
     * All the entities added to the query since the last call
     */
    added?: Entity[];
    /**
     * All the entities removed from the query since the last call
     */
    removed?: Entity[];
    /**
     * All the entities which selected components have changed since the last call
     */
    changed?: Entity[];
  }
}

export type QueriesConstructor = (OperatorComponent[] | OperatorComponent)[]

/**
 * A system that manipulates entities in the world.
 * Every run systems are executed and they create, remove or modify entities and components.
 */
export abstract class System {

  static queries?: QueriesConstructor;

  /**
   * Whether the system will execute during the world tick.
   */
  enabled? = true;
  initialized? = true;

  queriesOther? = {};
  queries?: Query[];

  mandatoryQueries? = [];

  priority? = 0;
  order? = 0;

  executeTime?: number;

  /**
   * It will get called each run by default (unless a custom scheduler is being used).
   * Usually it will be used to loop through the lists of entities from each query and
   * process the value of theirs components.
   */
  run(...queries): void {};

  /**
   * This function is called when the system is registered in a world (Calling `world.registerSystem`)
   * and can be used to initialize anything the system needs.
   */
  init?(): void;

  /**
   * Resume execution of this system.
   */
  play?() {
    this.enabled = true;
  }

  /**
   * Stop execution of this system.
   */
  stop?() {
    this.enabled = false;
  }
}


export function SystemData(...queries: QueriesConstructor) {
  return <T extends typeof System>(constructor: T) => {
    constructor.queries = queries;
    constructor.prototype.queries = [];

    return constructor;
  }
}
