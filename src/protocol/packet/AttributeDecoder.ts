import { Buffer } from 'buffer';
import { PacketDecodeError } from '@app/error/PacketDecodeError';
import { AttributeFactory } from '@app/protocol/packet/AttributeFactory';
import { IAttribute } from '@app/protocol/packet/attributes/IAttribute';
import { Attributes } from '@app/protocol/packet/attributes/Attributes';
import { AttributeError } from '@app/error/AttributeError';

export class AttributeDecoder {
  private static HEADER_LENGTH = 20;
  private constructor(
    private buffer: Buffer,
    private offset: number = AttributeDecoder.HEADER_LENGTH
  ) {}

  /**
   * Decode the attributes from the buffer.
   * @param buffer The buffer to decode. incluede header
   * @param secret The secret to use for decoding.
   * @returns The decoded attributes or a PacketDecodeError if the buffer is invalid.
   */
  static decode(buffer: Buffer, secret: string): Attributes {
    const decoder = new AttributeDecoder(buffer);
    const attributes: IAttribute[] = [];
    while (decoder.offset < buffer.length) {
      const [attribute, length] = decoder.decodeOne(decoder.offset, secret);
      attributes.push(attribute);
      decoder.offset += length;
    }

    console.log(attributes);

    return new Attributes(attributes);
  }

  private decodeOne(offset: number, secret: string): [attribute: IAttribute, length: number] {
    if (this.buffer.length - offset < 2) {
      throw new PacketDecodeError(`Incomplete attribute at offset ${offset}`, 'INVALID_ATTRIBUTE');
    }
    const type = this.buffer.readUInt8(offset);
    const length = this.buffer.readUInt8(offset + 1);

    if (length < 2) {
      throw new PacketDecodeError(
        `Invalid attribute length: ${length} (minimum 2) for type ${type}`,
        'INVALID_ATTRIBUTE'
      );
    }

    if (offset + length > this.buffer.length) {
      throw new PacketDecodeError(
        `Attribute length ${length} exceeds remaining buffer at offset ${offset}`,
        'INVALID_ATTRIBUTE'
      );
    }

    try {
      const maybeAttribute = AttributeFactory.create(
        type,
        this.buffer,
        offset,
        offset + length,
        secret
      );
      if (maybeAttribute instanceof Error) {
        throw maybeAttribute;
      }
      return [maybeAttribute, length];
    } catch (error) {
      if (error instanceof AttributeError) {
        throw new PacketDecodeError(`${error.message}`, 'INVALID_ATTRIBUTE');
      }
      throw error;
    }
  }
}
