import { EntityManager } from '../entity';
import { QueryManager } from '../query';
import { SystemConstructor } from '../system.interface';
import { System } from './system';

// tslint:disable:no-bitwise

export class SystemManager {
  systems = new Map<SystemConstructor<System>, System>();

  // order is important
  private executeSystems: System[] = []; // Systems that have `execute` method

  lastExecutedSystem = null;

  constructor(
    private entityManager: EntityManager,
    private queryManager: QueryManager,
  ) {}

  registerSystem(systemConstructor: SystemConstructor<System>, attributes?: any) {
    if (this.systems.has(systemConstructor)) {
      console.warn(`System '${systemConstructor.name}' already registered.`);

      return this;
    }

    const system = new systemConstructor();

    const queries = systemConstructor.queries;

    if (queries && queries.length !== 0) {

      system.queries = [];

      for (const operatorCopmonents of queries) {
        const query = this.queryManager.getQuery(operatorCopmonents, this.entityManager.entities);

        system.queries.push(query);
      }
    }

    // ----------

    if (system.init) {
      system.init();
    }

    system.order = this.systems.size;
    this.systems.set(systemConstructor, system);

    if (system.run) {
      this.executeSystems.push(system);
    }

    return this;
  }

  getSystem(systemConstructor: SystemConstructor<System>): System {
    return this.systems.get(systemConstructor);
  }

  getSystems(): Map<SystemConstructor<System>, System> {
    return this.systems;
  }

  removeSystem(systemConstructor: SystemConstructor<System>): void {
    this.systems.delete(systemConstructor);
  }

  runSystem(system: System): void {

    // console.log(`-- run System:: --`, system);

    const startTime = performance.now(); // ! debag performance

    // main run;
    system.components.length = 0;

    // console.log(`queries`, system);

    for (let i = 0; i < system.queries.length; i++) {
      system.queries[i].prepareComponents();
      system.components.push(system.queries[i].components);
    }

    system.run.apply(system, system.components);

    system.executeTime = performance.now() - startTime; // ! debag performance
    this.lastExecutedSystem = system;

    // clearEvents(system);
  }

  stop(): void {
    for (const system of this.executeSystems) {
      system.stop();
      system.executeTime = 0; // ! debag performance
    }
  }

  run(): void {
    for (let i = 0; i < this.executeSystems.length; i++) {
      this.runSystem(this.executeSystems[i]);
    }
  }

  stats() {
    const stats = {
      numSystems: this.systems.size,
      systems: {}
    };

    for (const system of this.systems) {
      const systemStats = (stats.systems[system.constructor.name] = {
        queries: {}
      });

      for (const name in (system as any).ctx) {
        if ((system as any).ctx.hasOwnProperty(name)) {
          systemStats.queries[name] = (system as any).ctx[name].stats();
        }
      }
    }

    return stats;
  }
}
