import { System } from '../system.interface';

export const canExecute = (system: System) => {
  if (system.mandatoryQueries.length === 0) { return true; }

  for (const query of system.mandatoryQueries) {
    if (query.entities.length === 0) {
      return false;
    }
  }

  return true;
};
