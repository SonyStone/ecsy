import { Component } from '../component.interface';

const proxyMap = new WeakMap();

const proxyHandler = {
  set(target, prop) {
    throw new Error(
      `Tried to write to "${target.constructor.name}#${String(
        prop
      )}" on immutable component. Use .getMutableComponent() to modify a component.`
    );
  }
};

export const wrapImmutableComponent = (component: Component) => {
  if (component === undefined) {
    return undefined;
  }

  let wrappedComponent = proxyMap.get(component);

  if (!wrappedComponent) {
    wrappedComponent = new Proxy(component, proxyHandler);
    proxyMap.set(component, wrappedComponent);
  }

  return wrappedComponent;
};
