import type { RemoteInfo } from 'dgram';
import { Packet } from '@app/protocol/packet/Packet';
import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { INasProvider } from '@app/protocol/nas/INasProvider';
import { PacketDecodeError } from '@app/error/PacketDecodeError';
import { Logger } from '@app/logger/Logger';
import { NAS } from '@app/protocol/nas/NAS';

export class RadiusPacketHandler implements IPacketHandler {
  constructor(private readonly nasProvider: INasProvider) {}

  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer | null> {
    try {
      const nas = await this.nasProvider.getNas(rinfo.address);
      if (nas === null) {
        throw new Error('NAS not found');
      }
      const packet = Packet.from(buffer, nas);
      if (packet instanceof PacketDecodeError) {
        throw packet;
      }

      const response = await this.createResponse(packet, nas);
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

  async createResponse(packet: Packet, nas: NAS): Promise<Buffer | null> {
    return packet.encode(nas);
  }
}
