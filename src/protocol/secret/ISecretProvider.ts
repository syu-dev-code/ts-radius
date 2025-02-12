import type { RemoteInfo } from 'dgram';

export interface ISecretProvider {
  /**
   * Retrieves the RADIUS shared secret for a given client address
   * @param address - The client's IP address from the UDP packet. Note: This is the source IP address of the packet, not the NAS-IP-Address attribute
   * @returns The shared secret if found, `null` otherwise
   */
  getSecret(address: RemoteInfo['address']): Promise<string | null>;

  /**
   * Sets the RADIUS shared secret for a given client address
   * @param address - The client's IP address to associate with the secret
   * @param secret - The RADIUS shared secret to store
   */
  setSecret(address: RemoteInfo['address'], secret: string): Promise<void>;
}
