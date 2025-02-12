import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import type { RemoteInfo } from 'dgram';

export class ThrowErrorPacketHandler implements IPacketHandler {
  constructor(private message: string) {}
  handleCalled = false;

  handle(packet: Buffer, rinfo: RemoteInfo): Promise<Buffer | null> {
    this.handleCalled = true;
    throw new Error(this.message);
  }

  onStop(): Promise<void> {
    return Promise.resolve();
  }
}
