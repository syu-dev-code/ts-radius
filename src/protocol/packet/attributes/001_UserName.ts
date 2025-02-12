import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class UserName extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 1;
  public static readonly NAME = 'User-Name';

  /**
   * utf-8 encoded string
   */
  public readonly value: string;

  /**
   * User-Name attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length < 3) {
      this.raiseLengthError(UserName);
    }
    this.value = this.getValue(buffer, start, end).toString('utf-8');
  }

  static from(value: string): UserName {
    return new UserName(Buffer.from(value, 'utf-8'), 0, value.length);
  }

  encodeValue(): Buffer {
    return Buffer.from(this.value, 'utf-8');
  }
}
