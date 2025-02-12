import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class FramedRouting extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 10;
  public static readonly NAME = 'Framed-Routing';
  public static readonly VALUES = {
    0: 'NONE',
    1: 'SEND',
    2: 'LISTEN',
    3: 'SEND_AND_LISTEN',
  } as const;

  public readonly value: FramedRoutingNumber;

  /**
   * Framed-Routing attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(FramedRouting);
    }
    const value = this.getValue(buffer, start, end).readUInt32BE(0);
    if (!(value in FramedRouting.VALUES)) {
      this.raiseValueError(value, FramedRouting);
    }
    this.value = value as FramedRoutingNumber;
  }

  public asString(): FramedRoutingString {
    return FramedRouting.VALUES[this.value];
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }
}

export type FramedRoutingNumber = keyof typeof FramedRouting.VALUES;
export type FramedRoutingString = (typeof FramedRouting.VALUES)[FramedRoutingNumber];
