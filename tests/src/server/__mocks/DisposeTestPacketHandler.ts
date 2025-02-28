import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { waitFor } from '@tests/libs/lib';
import type { RemoteInfo } from 'dgram';

export class DisposeTestPacketHandler implements IPacketHandler {
  public abort = false;

  constructor() {}
  async dispose(): Promise<void> {}
  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer> {
    while (!this.abort) {
      await waitFor(1);
    }
    return buffer;
  }
}
