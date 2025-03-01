import type { RemoteInfo } from 'dgram';
import { Packet } from '@app/protocol/packet/Packet';
import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { INasProvider } from '@app/protocol/nas/INasProvider';
import { PacketDecodeError } from '@app/error/PacketDecodeError';
import { Logger } from '@app/logger/Logger';
import { RadiusTransaction } from '@app/protocol/packet/RadiusTransaction';

export class RadiusPacketHandler implements IPacketHandler {
  constructor(
    private readonly nasProvider: INasProvider,
    private readonly transaction: RadiusTransaction
  ) {}

  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer | null> {
    try {
      const nas = await this.nasProvider.getNas(rinfo.address);
      if (nas === null) {
        Logger.log('RADIUS_ON_HANDLE_NAS_NOT_FOUND', { ...rinfo });
        return null;
      }

      const packet = Packet.from(buffer, nas);
      if (packet instanceof PacketDecodeError) {
        Logger.log('RADIUS_ON_HANDLE_PACKET_DECODE_ERROR', { ...rinfo, error: packet.message });
        return null;
      }

      // Acquire a transaction for the packet
      const isNotDuplicate = await this.transaction.acquire(rinfo, packet.identifier);
      if (!isNotDuplicate) {
        Logger.log('RADIUS_TRANSACTION_DUPLICATED_REQUEST', { ...rinfo });
        return null;
      }

      try {
        // Process the packet
        const response = packet.encode(nas);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        Logger.log('RADIUS_ON_HANDLE_SUCCESS', { ...rinfo });
        return response;
      } finally {
        // Release the transaction for the packet
        this.transaction.release(rinfo, packet.identifier).catch((error) => {
          Logger.log('RADIUS_TRANSACTION_RELEASE_ERROR', { ...rinfo, error: `${error}` });
        });
      }
    } catch (error) {
      Logger.log('RADIUS_ON_HANDLE_ERROR', { ...rinfo, error: `${error}` });
      return null;
    }
  }

  async dispose(): Promise<void> {
    await this.transaction.dispose();
  }
}
