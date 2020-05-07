export class CanvasContext {
  ctx: CanvasRenderingContext2D = null;
}

export class CanvasSize {
  width = 0;
  height = 0;
}

export class CanvasData {

  width = this.canvas.width = window.innerWidth;
  height = this.canvas.height = window.innerHeight;
  ctx = this.canvas.getContext('2d');

  private sizeUpdateListener: (this: Window, ev: UIEvent) => any;

  constructor(
    public canvas: HTMLCanvasElement
  ) {}

  getContext(): CanvasContext {
    return {
      ctx: this.ctx,
    }
  }

  getSize(): CanvasSize {
    return {
      height: this.height,
      width: this.width,
    }
  }

  sizeUpdater(component: CanvasSize): void {
    this.sizeUpdateListener = () => {
      component.width = this.canvas.width = window.innerWidth
      component.height = this.canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', this.sizeUpdateListener, false);
  }

  destroy(): void {
    window.removeEventListener('resize', this.sizeUpdateListener);
  }
}