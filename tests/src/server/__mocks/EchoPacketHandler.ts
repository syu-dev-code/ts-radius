import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import type { RemoteInfo } from 'dgram';

export class EchoPacketHandler implements IPacketHandler {
  public onStopCalled = false;
  public handleCalled = false;

  handle(packet: Buffer, rinfo: RemoteInfo): Promise<Buffer | null> {
    this.handleCalled = true;
    return Promise.resolve(packet);
  }
  onStop(): Promise<void> {
    this.onStopCalled = true;
    return Promise.resolve();
  }
}
