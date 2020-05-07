import { Component, Constructor } from '../component.interface';

/**
 * Return the name of a component
 */
export function getName(componentConstructor: Constructor<Component>) {
  return componentConstructor.name;
}
