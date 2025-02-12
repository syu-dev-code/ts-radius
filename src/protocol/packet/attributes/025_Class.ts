import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class Class extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 25;
  public static readonly NAME = 'Class';

  /**
   * The class data as a Buffer to preserve exact octets
   * This value should be sent unmodified to the accounting server
   */
  public readonly value: Buffer;

  /**
   * Class attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   *
   * This Attribute is available in Access-Accept and should be sent unmodified
   * to the accounting server as part of the Accounting-Request packet.
   * The client must not interpret the attribute locally.
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length < 3) {
      this.raiseLengthError(Class);
    }
    this.value = this.getValue(buffer, start, end);
  }

  static from(value: Buffer): Class {
    return new Class(value, 0, value.length);
  }

  encodeValue(): Buffer {
    return Buffer.from(this.value);
  }
}
