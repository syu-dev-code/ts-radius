import { AttributeClass } from '@app/types/Attribute';

export class AttributeError extends Error {
  constructor(
    message: string,
    public readonly clazz: AttributeClass
  ) {
    super(message);
    const name = 'NAME' in this.clazz ? this.clazz.NAME : this.clazz.name;
    this.message = `${name}: ${message}`;
    this.name = AttributeError.name;
  }
}
