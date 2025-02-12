import { IAttribute } from '@app/protocol/packet/attributes/IAttribute';
import { ATTRIBUTES_ENTRIES } from '@app/protocol/packet/attributes/AttributeEntries';

export class AttributeFactory {
  static create(
    type: number,
    buffer: Buffer,
    start: number,
    end: number,
    secret: string
  ): IAttribute | Error {
    if (!this.isDefined(type)) {
      return new Error(`Unknown attribute type: ${type}`);
    }
    return new ATTRIBUTES_ENTRIES[type](buffer, start, end, secret);
  }
  static isDefined(type: number): type is keyof typeof ATTRIBUTES_ENTRIES {
    return type in ATTRIBUTES_ENTRIES;
  }
}
