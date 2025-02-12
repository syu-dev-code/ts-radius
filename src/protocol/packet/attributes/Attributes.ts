import { IAttribute } from '@app/protocol/packet/attributes/IAttribute';

export class Attributes {
  private attributes: IAttribute[] = [];

  constructor(attributes: IAttribute[]) {
    this.attributes = attributes;
  }

  entries(): IAttribute[] {
    return this.attributes;
  }

  getByType<T extends IAttribute>(clazz: new (...args: any[]) => T): T[] {
    return this.attributes.filter((attr): attr is T => attr instanceof clazz);
  }
}
