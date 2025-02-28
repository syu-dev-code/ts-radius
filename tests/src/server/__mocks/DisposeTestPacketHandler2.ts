import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { waitFor } from '@tests/libs/lib';
import type { RemoteInfo } from 'dgram';

export class DisposeTestPacketHandler2 implements IPacketHandler {
  constructor(private waitTime: number) {}
  async dispose(): Promise<void> {}
  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer> {
    await waitFor(this.waitTime);
    return buffer;
  }
}
