import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { staticImplements } from '@app/decorators/staticImplements';

@staticImplements<IAttributeStatic>()
export class ServiceType extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 6;
  public static readonly NAME = 'Service-Type';
  public static readonly VALUES = {
    1: 'LOGIN',
    2: 'FRAMED',
    3: 'CALLBACK_LOGIN',
    4: 'CALLBACK_FRAMED',
    5: 'OUTBOUND',
    6: 'ADMINISTRATIVE',
    7: 'NAS_PROMPT',
    8: 'AUTHENTICATE_ONLY',
    9: 'CALLBACK_NAS_PROMPT',
    10: 'CALL_CHECK',
    11: 'CALLBACK_ADMINISTRATIVE',
  } as const;

  public readonly value: ServiceTypeNumber;

  /**
   * Service-Type attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number) {
    super(start, end);

    if (this.length !== 6) {
      this.raiseLengthError(ServiceType);
    }
    const value = this.getValue(buffer, start, end).readUInt32BE(0);
    if (!(value in ServiceType.VALUES)) {
      this.raiseValueError(value, ServiceType);
    }
    this.value = value as ServiceTypeNumber;
  }

  encodeValue(): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(this.value, 0);
    return buffer;
  }

  public asString(): ServiceTypeString {
    return ServiceType.VALUES[this.value];
  }
}

export type ServiceTypeNumber = keyof typeof ServiceType.VALUES;
export type ServiceTypeString = (typeof ServiceType.VALUES)[ServiceTypeNumber];
