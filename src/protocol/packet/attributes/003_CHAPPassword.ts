import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { staticImplements } from '@app/decorators/staticImplements';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';

@staticImplements<IAttributeStatic>()
export class CHAPPassword extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 3;
  public static readonly NAME = 'CHAP-Password';

  public readonly value: Readonly<{ ident: Buffer; response: Buffer }>;

  /**
   * CHAP-Password attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 19) {
      this.raiseLengthError(CHAPPassword);
    }
    const value = this.getValue(buffer, start, end);
    this.value = {
      ident: value.subarray(0, 1),
      response: value.subarray(1, 17),
    };
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(17);
    this.value.ident.copy(buffer, 0);
    this.value.response.copy(buffer, 1);
    return buffer;
  }
}
