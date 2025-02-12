import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { IPV4Address } from '@app/types/Attribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class FramedIPAddress extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 8;
  public static readonly NAME = 'Framed-IP-Address';
  public static readonly USER_SELECT = 0xffffffff;
  public static readonly NAS_SELECT = 0xfffffffe;

  public readonly value: IPV4Address;

  /**
   * Framed-IP-Address attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(FramedIPAddress);
    }
    this.value = [...this.getValue(buffer, start, end)] as IPV4Address;
  }

  get selection(): FramedIPAddressSelection {
    switch (Buffer.from(this.value).readUInt32BE(0)) {
      case FramedIPAddress.USER_SELECT:
        return 'user';
      case FramedIPAddress.NAS_SELECT:
        return 'nas';
      default:
        return 'specific';
    }
  }

  encodeValue(): Buffer {
    return Buffer.from(this.value);
  }
}

export type FramedIPAddressSelection = 'user' | 'nas' | 'specific';
