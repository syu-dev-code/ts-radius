import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class FramedCompression extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 13;
  public static readonly NAME = 'Framed-Compression';
  public static readonly VALUES = {
    0: 'NONE',
    1: 'VJ_TCP_IP',
    2: 'IPX',
    3: 'STAC_LZS',
  } as const;

  public readonly value: FramedCompressionNumber;

  /**
   * Framed-Compression attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(FramedCompression);
    }
    const value = this.getValue(buffer, start, end).readUInt32BE(0);
    if (!(value in FramedCompression.VALUES)) {
      this.raiseValueError(value, FramedCompression);
    }
    this.value = value as FramedCompressionNumber;
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }
}

export type FramedCompressionNumber = keyof typeof FramedCompression.VALUES;
export type FramedCompressionString = (typeof FramedCompression.VALUES)[FramedCompressionNumber];
