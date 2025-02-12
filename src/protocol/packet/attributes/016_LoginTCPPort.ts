import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class LoginTCPPort extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 16;
  public static readonly NAME = 'Login-TCP-Port';
  public static readonly MIN_VALUE = 0;
  public static readonly MAX_VALUE = 65535;

  public readonly value: number;

  /**
   * Login-TCP-Port attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(LoginTCPPort);
    }
    this.value = this.getValue(buffer, start, end).readUInt32BE(0);
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }
}
