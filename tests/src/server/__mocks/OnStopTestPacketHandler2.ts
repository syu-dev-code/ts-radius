import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { waitFor } from '@tests/libs/lib';
import type { RemoteInfo } from 'dgram';

export class OnStopTestPacketHandler2 implements IPacketHandler {
  constructor(private waitTime: number) {}
  async onStop(): Promise<void> {}
  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer> {
    await waitFor(this.waitTime);
    return buffer;
  }
}
