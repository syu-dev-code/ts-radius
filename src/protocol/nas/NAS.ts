export class NAS {
  constructor(readonly config: NASConfig) {}

  /**
   * Matches the NAS with the given address
   * @param address - The address to match
   * @returns True if the NAS matches the address, false otherwise
   */
  async match(address: string): Promise<boolean> {
    return this.config.address.value === address;
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
