import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class SessionTimeout extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 27;
  public static readonly NAME = 'Session-Timeout';

  /**
   * Maximum number of seconds for the session
   */
  public readonly value: number;

  /**
   * Session-Timeout attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   *
   * This Attribute sets the maximum number of seconds of service to be
   * provided to the user before termination of the session or prompt.
   * Available in Access-Accept or Access-Challenge.
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length !== 6) {
      this.raiseLengthError(SessionTimeout);
    }
    this.value = this.getValue(buffer, start, end).readUInt32BE(0);
  }

  static from(value: number): SessionTimeout {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value);
    return new SessionTimeout(buffer, 0, buffer.length);
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }
}
