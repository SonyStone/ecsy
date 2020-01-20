import { System } from './system.interface';

export abstract class SystemBase implements System {
  enabled = true;
  initialized = true;

  queriesOther = {};
  queries = {};

  mandatoryQueries = [];

  run() {}

  play() {
    this.enabled = true;
  }

  stop() {
    this.enabled = false;
  }
}