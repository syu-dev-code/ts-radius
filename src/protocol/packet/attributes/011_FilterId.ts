import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class FilterId extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 11;
  public static readonly NAME = 'Filter-Id';

  public readonly value: string;

  /**
   * Filter-Id attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);
    if (this.length < 3) {
      this.raiseLengthError(FilterId);
    }
    this.value = this.getValue(buffer, start, end).toString('utf8');
  }

  encodeValue(): Buffer {
    return Buffer.from(this.value, 'utf8');
  }
}
