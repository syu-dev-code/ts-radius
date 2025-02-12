import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { waitFor } from '@tests/libs/lib';
import type { RemoteInfo } from 'dgram';

export class OnStopTestPacketHandler implements IPacketHandler {
  public abort = false;

  constructor() {}
  async onStop(): Promise<void> {}
  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer> {
    while (!this.abort) {
      await waitFor(1);
    }
    return buffer;
  }
}
