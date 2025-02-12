import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';
import { IPV4Address } from '@app/types/Attribute';

@staticImplements<IAttributeStatic>()
export class LoginIPHost extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 14;
  public static readonly NAME = 'Login-IP-Host';
  public static readonly USER_SELECT = 0xffffffff;
  public static readonly NAS_SELECT = 0;

  public readonly value: IPV4Address;

  /**
   * Login-IP-Host attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(LoginIPHost);
    }
    this.value = [...this.getValue(buffer, start, end)] as IPV4Address;
  }

  /**
   * Get the select mode of the ip address
   */
  get selection(): LoginIPHostSelection {
    switch (Buffer.from(this.value).readUInt32BE(0)) {
      case LoginIPHost.USER_SELECT:
        return 'user';
      case LoginIPHost.NAS_SELECT:
        return 'nas';
      default:
        return 'specific';
    }
  }

  encodeValue(): Buffer {
    return Buffer.from(this.value);
  }
}

export type LoginIPHostSelection = 'user' | 'nas' | 'specific';
