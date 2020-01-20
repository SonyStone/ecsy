import { ComponentConstructor } from '../component.interface';
import { getName } from './get-name';

/**
 * Get a key from a list of components
 * @param Components Array of components to generate the key
 */
export function queryKey(componentConstructor: (ComponentConstructor | any)[]) {
  const names = [];

  for (const T of componentConstructor) {
    if (typeof T === 'object') {
      const operator = T.operator === 'not' ? '!' : T.operator;
      names.push(operator + getName(T.Component));
    } else {
      names.push(getName(T));
    }
  }

  return names.sort().join('-');
}
