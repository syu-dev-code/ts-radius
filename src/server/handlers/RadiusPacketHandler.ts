import type { RemoteInfo } from 'dgram';
import { Packet } from '@app/protocol/packet/Packet';
import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { ISecretProvider } from '@app/protocol/secret/ISecretProvider';
import { PacketDecodeError } from '@app/error/PacketDecodeError';
import { Logger } from '@app/logger/Logger';

export class RadiusPacketHandler implements IPacketHandler {
  private secretProvider: ISecretProvider;

  constructor(secretProvider: ISecretProvider) {
    this.secretProvider = secretProvider;
  }

  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer | null> {
    try {
      const secret = await this.secretProvider.getSecret(rinfo.address);
      if (secret === null) {
        throw new Error('Secret not found');
      }
      const packet = Packet.from(buffer, secret);
      if (packet instanceof PacketDecodeError) {
        throw packet;
      }

      const response = await this.createResponse(packet, secret);
      Logger.log('RADIUS_ON_HANDLE_SUCCESS', { ...rinfo });
      return response;
    } catch (error) {
      Logger.log('RADIUS_ON_HANDLE_ERROR', { ...rinfo, error: `${error}` });
      return null;
    }
  }

  async onStop(): Promise<void> {
    // Nothing to do
  }

  async createResponse(packet: Packet, secret: string): Promise<Buffer | null> {
    return packet.encode(secret);
  }
}
