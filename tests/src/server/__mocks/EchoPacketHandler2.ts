import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import type { RemoteInfo } from 'dgram';

export class EchoPacketHandler2 implements IPacketHandler {
  public handledPackets: [RemoteInfo, Buffer][] = [];
  async onStop(): Promise<void> {
    return;
  }

  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer> {
    this.handledPackets.push([rinfo, buffer]);
    return buffer;
  }
}
