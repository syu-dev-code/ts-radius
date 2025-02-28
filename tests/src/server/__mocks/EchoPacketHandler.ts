import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import type { RemoteInfo } from 'dgram';

export class EchoPacketHandler implements IPacketHandler {
  public disposeMethodCalled = false;
  public handleCalled = false;

  handle(packet: Buffer, rinfo: RemoteInfo): Promise<Buffer | null> {
    this.handleCalled = true;
    return Promise.resolve(packet);
  }
  async dispose(): Promise<void> {
    this.disposeMethodCalled = true;
    return Promise.resolve();
  }
}
