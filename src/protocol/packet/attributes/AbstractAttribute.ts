import { AttributeError } from '@app/error/AttributeError';
import { IAttribute } from '@app/protocol/packet/attributes/IAttribute';
import { Attributes } from '@app/protocol/packet/attributes/Attributes';
import { AttributeClass } from '@app/types/Attribute';
import { Printable } from '@app/types/Utils';

export abstract class AbstractAttribute implements IAttribute {
  private static readonly VALUE_OFFSET = 2;
  public static strict = true;
  public static strictLength = true;
  public static strictValue = true;

  abstract readonly value: unknown;
  public readonly length: number;

  constructor(start: number, end: number) {
    this.length = end - start;
  }

  /**
   * Returns the type of the attribute.
   * @returns The type of the attribute.
   */
  get type(): number {
    if (!('TYPE' in this.constructor)) {
      throw new Error(`${this.constructor.name} must have static TYPE property`);
    }
    if (typeof this.constructor.TYPE !== 'number') {
      throw new Error(`${this.constructor.name}.TYPE must be a number`);
    }
    return this.constructor.TYPE;
  }

  /**
   * Returns the name of the attribute.
   * @returns The name of the attribute.
   */
  get name(): string {
    if (!('NAME' in this.constructor)) {
      throw new Error(`${this.constructor.name} must have static NAME property`);
    }
    if (typeof this.constructor.NAME !== 'string') {
      throw new Error(`${this.constructor.name}.NAME must be a string`);
    }
    return this.constructor.NAME;
  }

  private isStrict(clazz: AttributeClass): boolean {
    return 'strict' in clazz && clazz.strict === true;
  }

  private isStrictLength(clazz: AttributeClass): boolean {
    return 'strictLength' in clazz && clazz.strictLength === true;
  }

  private isStrictValue(clazz: AttributeClass): boolean {
    return 'strictValue' in clazz && clazz.strictValue === true;
  }

  /**
   * Raises an error if the attribute length is invalid and both strict mode and strict length checking are enabled.
   * Length validation is skipped if either:
   * - strict mode is disabled (clazz.strict = false)
   * - or strict length checking is disabled (clazz.strictLength = false)
   */
  protected raiseLengthError(clazz: AttributeClass): void {
    if (!this.isStrict(clazz) || !this.isStrictLength(clazz)) {
      return;
    }
    throw new AttributeError(`Invalid length: ${this.length}`, clazz);
  }

  /**
   * Raises an error if the attribute value is invalid and both strict mode and strict value checking are enabled.
   * Value validation is skipped if either:
   * - strict mode is disabled (clazz.strict = false)
   * - or strict value checking is disabled (clazz.strictValue = false)
   */
  protected raiseValueError(valueWithDescription: Printable, clazz: AttributeClass): void {
    if (!this.isStrict(clazz) || !this.isStrictValue(clazz)) {
      return;
    }
    throw new AttributeError(`Invalid value: ${valueWithDescription}`, clazz);
  }

  /**
   * Returns a buffer containing the attribute value.
   * The value is located at the offset of 2 bytes from the start of the attribute.
   * @param buffer - The buffer containing the attribute.
   * @param start - The start index of the attribute in the buffer.
   * @param end - The end index of the attribute in the buffer.
   * @returns A buffer containing the attribute value.
   */
  protected getValue(buffer: Buffer, start: number, end: number): Buffer {
    return buffer.subarray(start + AbstractAttribute.VALUE_OFFSET, end);
  }

  encode(): Buffer {
    const buffer = Buffer.alloc(this.length);
    buffer.writeUInt8(this.type, 0);
    buffer.writeUInt8(this.length, 1);
    this.encodeValue().copy(buffer, 2);
    return buffer;
  }

  abstract encodeValue(): Buffer;
}
