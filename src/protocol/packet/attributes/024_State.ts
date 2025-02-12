import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class State extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 24;
  public static readonly NAME = 'State';

  /**
   * The state data as a Buffer to preserve exact octets
   * This value must be sent unmodified in subsequent requests
   */
  public readonly value: Buffer;

  /**
   * State attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   *
   * This Attribute is available in Access-Challenge and must be sent unmodified
   * in the subsequent Access-Request.
   *
   * Also available in Access-Accept with Termination-Action=RADIUS-Request,
   * and must be sent unmodified in the new Access-Request upon termination.
   *
   * A packet must have only zero or one State Attribute.
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length < 3) {
      this.raiseLengthError(State);
    }
    this.value = this.getValue(buffer, start, end);
  }

  static from(value: Buffer): State {
    return new State(value, 0, value.length);
  }

  encodeValue(): Buffer {
    return Buffer.from(this.value);
  }
}
