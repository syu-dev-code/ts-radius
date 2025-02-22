import { IAttribute } from '@app/protocol/packet/attributes/IAttribute';
import { ATTRIBUTES_ENTRIES } from '@app/protocol/packet/attributes/AttributeEntries';
import { NAS } from '@app/protocol/nas/NAS';

export class AttributeFactory {
  static create(
    type: number,
    buffer: Buffer,
    start: number,
    end: number,
    nas: NAS
  ): IAttribute | Error {
    if (!this.isDefined(type)) {
      return new Error(`Unknown attribute type: ${type}`);
    }
    return new ATTRIBUTES_ENTRIES[type](buffer, start, end, nas);
  }
  static isDefined(type: number): type is keyof typeof ATTRIBUTES_ENTRIES {
    return type in ATTRIBUTES_ENTRIES;
  }
}
