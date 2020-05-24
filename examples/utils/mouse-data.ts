import { Vector2 } from './vector-2';

export class MouseIsDown {
  down: boolean;
}

export class MousePoint extends Vector2 {}

export class MouseData {
  x = 0;
  y = 0;
  down = false;

  private mousemoveListener: (this: HTMLElement, ev: MouseEvent) => any;
  private mousedownListener: (this: Window, ev: MouseEvent) => any

  constructor(
    private element: HTMLElement,
    private window: Window & typeof globalThis,
  ) {}

  mouseMoveUpdater(component: MousePoint): void {
    this.mousemoveListener = ({ x, y }) => {
      [component.x, component.y] = [this.x, this.y] = [x, y];
    };
    this.element.addEventListener(`mousemove`, this.mousemoveListener);
  }

  mousedownUpdater(component: MouseIsDown): void {
    this.mousedownListener = () => {
      component.down = this.down = !this.down;
    }
    this.window.addEventListener(`mousedown`, this.mousedownListener);
    this.window.addEventListener(`mouseup`  , this.mousedownListener);
  }

  destroy(): void {
    this.window.removeEventListener('mousemove', this.mousemoveListener);
    this.window.removeEventListener(`mousedown`, this.mousedownListener);
    this.window.removeEventListener(`mouseup`  , this.mousedownListener);
  }
}
