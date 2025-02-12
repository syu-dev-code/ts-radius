import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { staticImplements } from '@app/decorators/staticImplements';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';

@staticImplements<IAttributeStatic>()
export class NASPort extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 5;
  public static readonly NAME = 'NAS-Port';

  /**
   * Port number
   */
  public readonly value: number;

  /**

   * NAS-Port attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(NASPort);
    }
    this.value = this.getValue(buffer, start, end).readUInt32BE(0);
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }
}
