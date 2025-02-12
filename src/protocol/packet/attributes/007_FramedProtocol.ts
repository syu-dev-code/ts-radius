import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class FramedProtocol extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 7;
  public static readonly NAME = 'Framed-Protocol';
  public static readonly VALUES = {
    1: 'PPP',
    2: 'SLIP',
    3: 'ARAP',
    4: 'GANDALF_SLML',
    5: 'XYLOGICS_IPX_SLIP',
    6: 'X75_SYNC',
  } as const;

  public readonly value: FramedProtocolNumber;

  /**
   * Framed-Protocol attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(FramedProtocol);
    }
    const value = this.getValue(buffer, start, end).readUInt32BE(0);
    if (!(value in FramedProtocol.VALUES)) {
      this.raiseValueError(value, FramedProtocol);
    }
    this.value = value as FramedProtocolNumber;
  }

  public asString(): FramedProtocolString {
    return FramedProtocol.VALUES[this.value];
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }
}

export type FramedProtocolNumber = keyof typeof FramedProtocol.VALUES;
export type FramedProtocolString = (typeof FramedProtocol.VALUES)[FramedProtocolNumber];
