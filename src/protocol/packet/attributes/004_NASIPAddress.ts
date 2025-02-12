import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { staticImplements } from '@app/decorators/staticImplements';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { IPV4Address } from '@app/types/Attribute';

@staticImplements<IAttributeStatic>()
export class NASIPAddress extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 4;
  public static readonly NAME = 'NAS-IP-Address';

  /**
   * IPV4 address
   */
  public readonly value: IPV4Address;

  /**
   * NAS-IP-Address attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(NASIPAddress);
    }
    this.value = [...this.getValue(buffer, start, end)] as IPV4Address;
  }

  encodeValue(): Buffer {
    return Buffer.from(this.value);
  }
}
