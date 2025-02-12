import type { RemoteInfo } from 'dgram';

/**
 * Interface for handling UDP packets.
 * Used to implement various packet processing handlers for the server.
 */
export interface IPacketHandler {
  /**
   * Handles a UDP packet.
   * @param packet - The UDP packet to be handled.
   * @param rinfo - Remote information of the UDP packet
   * @returns A response buffer to the UDP packet, or `null` if the packet must be silently discarded (the server must **not** send any response).
   */
  handle(packet: Buffer, rinfo: RemoteInfo): Promise<Buffer | null>;

  /**
   * Called when the server is stopping. Clean up any resources if necessary.
   */
  onStop(): Promise<void>;
}
