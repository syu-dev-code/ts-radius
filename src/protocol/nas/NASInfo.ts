export class NASInfo {
  constructor(readonly config: NASConfig) {}

  /**
   * Matches the NASInfo with the given address
   * @param address - The address to match
   * @returns True if the NASInfo matches the address, false otherwise
   */
  async match(address: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}

export type NASConfig = {
  shortName: string;
  address: {
    value: string;
    type: 'ipaddr' | 'ipv4addr' | 'ipv6addr';
  };
  secret: string;
  proto?: string;
  requireMessageAuthenticator?: string;
  limitProxyState?: string;
  limit?: {
    maxConnections?: number;
    lifetime?: number;
    idleTimeout?: number;
  };
};
