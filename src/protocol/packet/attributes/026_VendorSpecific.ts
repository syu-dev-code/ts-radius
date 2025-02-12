import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class VendorSpecific extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 26;
  public static readonly NAME = 'Vendor-Specific';
  public static readonly MIN_LENGTH = 7;

  public readonly value: Readonly<{
    vendorId: number;
    attribute: VendorAttribute;
  }>;

  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length < VendorSpecific.MIN_LENGTH) {
      this.raiseLengthError(VendorSpecific);
    }

    const valueBuffer = this.getValue(buffer, start, end);
    this.value = {
      vendorId: valueBuffer.readUInt32BE(0),
      attribute: {
        type: valueBuffer.readUInt8(4),
        length: valueBuffer.readUInt8(5),
        value: valueBuffer.subarray(6, valueBuffer.length),
      },
    };
  }

  encodeValue(): Buffer {
    throw new Error('Not implemented');
  }
}

export interface VendorAttribute {
  type: number;
  length: number;
  value: Buffer;
}
