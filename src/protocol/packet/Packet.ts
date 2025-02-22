import { Buffer } from 'buffer';
import { PacketDecodeError } from '@app/error/PacketDecodeError';
import { Code } from '@app/protocol/packet/Code';
import { AttributeDecoder } from '@app/protocol/packet/AttributeDecoder';
import { Attributes } from '@app/protocol/packet/attributes/Attributes';
import { NAS } from '@app/protocol/nas/NAS';
export class Packet {
  // RFC2865: min packet size
  private static readonly MIN_LENGTH = 20;
  /**
   * RFC2865: max packet size
   */
  private static readonly MAX_LENGTH = 4096;

  private constructor(
    readonly code: Code,
    readonly identifier: number,
    readonly length: number,
    readonly authenticator: Buffer,
    readonly attributes: Attributes
  ) {}

  static from(packet: Buffer, nas: NAS): Packet | PacketDecodeError {
    if (packet.length > this.MAX_LENGTH) {
      return new PacketDecodeError(
        `Packet too large: ${packet.length} bytes (maximum ${this.MAX_LENGTH})`,
        'INVALID_LENGTH'
      );
    }

    if (packet.length < this.MIN_LENGTH) {
      return new PacketDecodeError(
        `Packet too short: ${packet.length} bytes (minimum ${this.MIN_LENGTH})`,
        'INVALID_LENGTH'
      );
    }

    const codeField = packet.readUInt8(0);
    const isValidCode = Code.isValid(codeField);
    if (!isValidCode) {
      return new PacketDecodeError(`Invalid code: ${codeField}`, 'INVALID_CODE');
    }
    const code = Code.from(codeField);

    const identifier = packet.readUInt8(1);
    if (identifier < 0 || identifier > 255) {
      return new PacketDecodeError(`Invalid identifier: ${identifier}`, 'INVALID_CODE');
    }

    const length = packet.readUInt16BE(2);
    if (length !== packet.length) {
      return new PacketDecodeError(
        `Length field (${length}) does not match actual length (${packet.length})`,
        'INVALID_LENGTH'
      );
    }

    const authenticator = packet.subarray(4, 20);
    if (authenticator.length !== 16) {
      return new PacketDecodeError('Invalid authenticator length', 'INVALID_AUTHENTICATOR');
    }

    const attributes = AttributeDecoder.decode(packet, nas);
    if (attributes instanceof PacketDecodeError) {
      return attributes;
    }
    return new this(code, identifier, length, authenticator, attributes);
  }

  private static _id: number = 1;

  encode(nas: NAS): Buffer {
    Packet._id++;
    const length = 20;
    const buffer = Buffer.alloc(length);
    buffer.writeUInt8(Code.table['Access-Accept'], 0);
    buffer.writeUInt8(Packet._id, 1);
    buffer.writeUInt16BE(length, 2);
    buffer.write(this.authenticator.toString('binary'), 4, 16, 'binary');
    return buffer;
  }
}
