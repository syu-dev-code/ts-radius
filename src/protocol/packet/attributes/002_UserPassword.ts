import { IAttribute, IAttributeStatic } from '@app/protocol/packet/attributes/IAttribute';
import { staticImplements } from '@app/decorators/staticImplements';
import { AbstractAttribute } from '@app/protocol/packet/attributes/AbstractAttribute';
import { RadiusPasswordEncryption } from '@app/protocol/crypt/RadiusPasswordEncryption';
import { NAS } from '@app/protocol/nas/NAS';
@staticImplements<IAttributeStatic>()
export class UserPassword extends AbstractAttribute implements IAttribute {
  public static readonly TYPE = 2;
  public static readonly NAME = 'User-Password';

  /**
   * utf-8 encoded string
   */
  public readonly value: string;
  private readonly secret: string;
  private readonly authenticator: Buffer;

  /**
   * User-Password attribute
   * @see https://www.iana.org/assignments/radius-types/radius-types.xhtml
   */
  constructor(buffer: Buffer, start: number, end: number, nas: NAS) {
    super(start, end);
    if (this.length < 18 || this.length > 130) {
      this.raiseLengthError(UserPassword);
    }
    const encrypted = this.getValue(buffer, start, end);
    const authenticator = buffer.subarray(4, 20);
    this.secret = nas.config.secret;
    this.authenticator = authenticator;
    this.value = RadiusPasswordEncryption.decrypt(encrypted, this.secret, this.authenticator);
  }

  encodeValue(): Buffer {
    return RadiusPasswordEncryption.encrypt(this.value, this.secret, this.authenticator);
  }
}
