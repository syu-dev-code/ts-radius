import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import type { RemoteInfo } from 'dgram';

export class SilentPacketHandler implements IPacketHandler {
  handleCalled = false;

  handle(packet: Buffer, rinfo: RemoteInfo): Promise<Buffer | null> {
    this.handleCalled = true;
    return Promise.resolve(null);
  }

  onStop(): Promise<void> {
    return Promise.resolve();
  }
}
