import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class LoginService extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 15;
  public static readonly NAME = 'Login-Service';
  public static readonly VALUES = {
    0: 'TELNET',
    1: 'RLOGIN',
    2: 'TCP_CLEAR',
    3: 'PORTMASTER',
    4: 'LAT',
    5: 'X25_PAD',
    6: 'X25_T3POS',
    8: 'TCP_CLEAR_QUIET',
  } as const;

  public readonly value: LoginServiceNumber;

  /**
   * Login-Service attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(LoginService);
    }
    const value = this.getValue(buffer, start, end).readUInt32BE(0);
    if (!(value in LoginService.VALUES)) {
      this.raiseValueError(value, LoginService);
    }
    this.value = value as LoginServiceNumber;
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }
}

export type LoginServiceNumber = keyof typeof LoginService.VALUES;
export type LoginServiceString = (typeof LoginService.VALUES)[LoginServiceNumber];
