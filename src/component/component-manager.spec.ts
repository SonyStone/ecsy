import { BarComponent, FooComponent } from '../helpers/components';
import { World } from '../world';


describe.skip('component-manager', () => {
  it('register components', () => {
    const world = new World();

    world.registerComponent(FooComponent);

    expect(world.componentsManager.componentPool.size).toBe(1);
    world.registerComponent(BarComponent);
    expect(world.componentsManager.componentPool.size).toBe(2);

    // Can't register twice the same component
    world.registerComponent(FooComponent);
    expect(world.componentsManager.componentPool.size).toBe(2);
  });
});
