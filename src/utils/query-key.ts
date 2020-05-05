import { ComponentConstructor } from '../component.interface';
import { OperatorComponent, Operators } from '../data';
import { getName } from './get-name';

const createKey = (operator: Operators, component: ComponentConstructor) =>
  `${operator}(${getName(component)})`;

/**
 * Get a key from a list of components
 * @param Components Array of components to generate the key
 */
export function queryKey(operatorComponents: OperatorComponent[] | OperatorComponent) {
  if (Array.isArray(operatorComponents)) {
    const names = [];

    for (const {operator, component} of operatorComponents) {
      names.push(createKey(operator, component));
    }

    return names.join('-');
  } else {
    const {operator, component} = operatorComponents;

    return createKey(operator, component)
  }
}

