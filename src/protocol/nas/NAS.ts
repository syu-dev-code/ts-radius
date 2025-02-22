import { AddressMatcher } from '@app/protocol/address/AddressMatcher';

export class NAS {
  constructor(readonly config: NASConfig) {}

  /**
   * Matches the NAS with the given address
   * @param srcAddress - The address to match
   * @returns True if the NAS matches the address, false otherwise
   */
  async match(srcAddress: string): Promise<boolean> {
    const type = this.config.address.type;
    const settingAddress = this.config.address.value;

    switch (type) {
      case 'ipaddr':
        return AddressMatcher.matchIpAddress(settingAddress, srcAddress);
      case 'ipv4addr':
        return AddressMatcher.matchIpv4Address(settingAddress, srcAddress);
      case 'ipv6addr':
        return AddressMatcher.matchIpv6Address(settingAddress, srcAddress);
    }
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
