import type { RemoteInfo } from 'dgram';

export type PacketHandler = (packet: Buffer, rinfo: RemoteInfo) => Promise<PacketHandlerResult>;
export type PacketHandlerResult = {
  doNext: boolean;
  response: Buffer | false;
};
