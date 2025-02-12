import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class FramedIPXNetwork extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 23;
  public static readonly NAME = 'Framed-IPX-Network';
  public static readonly NAS_SELECT = 0xfffffffe;

  /**
   * IPX network number
   */
  public readonly value: number;

  /**
   * Framed-IPX-Network attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(FramedIPXNetwork);
    }
    this.value = this.getValue(buffer, start, end).readUInt32BE(0);
  }

  get selection(): FramedIPXNetworkSelection {
    return this.value === FramedIPXNetwork.NAS_SELECT ? 'nas' : 'specific';
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }
}

export type FramedIPXNetworkSelection = 'nas' | 'specific';
