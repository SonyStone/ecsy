import { OperatorComponent } from './data';
import { System } from './system';

export interface Query {
  [key: string]: {
    components: OperatorComponent[];
    mandatory?: boolean;
    listen?: {
      /**
       * Get access to all the entities added to the query since the last call
       */
      added?: boolean;
      /**
       * Get access to all the entities removed from the query since the last call
       */
      removed?: boolean;
      /**
       * Get access to all the entities which Box or Transform components have changed since the last call
       */
      changed?: boolean | OperatorComponent[];
    };
  };
}

export interface SystemConstructor<T extends System> {
  new (...args: any): T;
  queries?: any[];
}


