import { Resettable } from './resettable.interface';

export interface Component extends Resettable {
  [key: string]: any;
  copy?(src: Component): void;
}

export type Constructor<T> = new (_) => T;
