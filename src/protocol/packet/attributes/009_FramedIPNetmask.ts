import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { IPV4Address } from '@app/types/Attribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class FramedIPNetmask extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 9;
  public static readonly NAME = 'Framed-IP-Netmask';

  public readonly value: IPV4Address;

  /**
   * Framed-IP-Netmask attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(FramedIPNetmask);
    }
    this.value = [...this.getValue(buffer, start, end)] as IPV4Address;
  }

  encodeValue(): Buffer {
    return Buffer.from(this.value);
  }
}
