import { isIPv4, isIPv6 } from 'net';
import dns from 'dns/promises';

export class AddressMatcher {
  /**
   * Matches an IP address with support for CIDR notation and DNS resolution
   * @param settingAddress - The address to match against (can be IP, CIDR, or domain name)
   * @param srcAddress - The source IP address to check
   * @returns True if the addresses match, false otherwise
   */
  static async matchIpAddress(settingAddress: string, srcAddress: string): Promise<boolean> {
    if (settingAddress === srcAddress) {
      return true;
    }
    if (settingAddress.includes('/')) {
      return this.matchCidrAddress(settingAddress, srcAddress);
    }
    return this.matchResolvedHostname(settingAddress, srcAddress);
  }

  /**
   * Matches an IPv4 address with support for wildcard
   * @param settingAddress - The IPv4 address to match against (can be '*' for any)
   * @param srcAddress - The source IPv4 address to check
   * @returns True if the addresses match, false otherwise
   */
  static matchIpv4Address(settingAddress: string, srcAddress: string): boolean {
    if (!isIPv4(srcAddress)) {
      return false;
    }
    if (settingAddress === '*') {
      return true;
    }
    return settingAddress === srcAddress;
  }

  /**
   * Matches an IPv6 address with support for wildcard
   * @param settingAddress - The IPv6 address to match against (can be '*' for any)
   * @param srcAddress - The source IPv6 address to check
   * @returns True if the addresses match, false otherwise
   */
  static matchIpv6Address(settingAddress: string, srcAddress: string): boolean {
    if (!isIPv6(srcAddress)) {
      return false;
    }
    if (settingAddress === '*') {
      return true;
    }
    return settingAddress === srcAddress;
  }

  /**
   * Attempts to resolve a domain name and match against the source address
   * @param hostname - The domain name to resolve
   * @param ipAddress - The source IP address to check
   * @returns True if the resolved address matches, false otherwise
   */
  private static async matchResolvedHostname(
    hostname: string,
    ipAddress: string
  ): Promise<boolean> {
    try {
      const addresses = await dns.resolve(hostname);
      return addresses.includes(ipAddress);
    } catch {
      return false;
    }
  }

  /**
   * Matches an IP address against a CIDR range
   * @param settingAddress - The CIDR notation address (e.g., "192.168.1.0/24")
   * @param srcAddress - The source IP address to check
   * @returns True if the address is in the CIDR range, false otherwise
   */
  private static matchCidrAddress(settingAddress: string, srcAddress: string): boolean {
    const [network, maskStr] = settingAddress.split('/');
    const mask = parseInt(maskStr, 10);
    return network.includes('.')
      ? this.matchIpv4Cidr(network, mask, srcAddress)
      : this.matchIpv6Cidr(network, mask, srcAddress);
  }

  private static matchCidr(
    network: string,
    srcAddress: string,
    mask: number,
    bitsPerUnit: 8 | 16,
    expandAddress: (ip: string) => number[]
  ): boolean {
    const networkBits = expandAddress(network);
    const srcBits = expandAddress(srcAddress);

    const maskUnits = Math.floor(mask / bitsPerUnit);
    const remainingBits = mask % bitsPerUnit;

    for (let i = 0; i < maskUnits; i++) {
      if (networkBits[i] !== srcBits[i]) {
        return false;
      }
    }

    if (remainingBits === 0) {
      return true;
    }

    const maxValue = 1 << bitsPerUnit;
    const maskValue = maxValue - (1 << (bitsPerUnit - remainingBits));
    const maskedNetworkBits = networkBits[maskUnits] & maskValue;
    const maskedSourceBits = srcBits[maskUnits] & maskValue;

    return maskedNetworkBits === maskedSourceBits;
  }

  /**
   * Matches an IPv4 address against a CIDR range
   * @param network - The network portion of the CIDR
   * @param mask - The subnet mask bits
   * @param srcAddress - The source IPv4 address to check
   * @returns True if the address is in the CIDR range, false otherwise
   */
  private static matchIpv4Cidr(network: string, mask: number, srcAddress: string): boolean {
    const expand = (ip: string): number[] => {
      return ip.split('.').map((n) => parseInt(n, 10));
    };
    return this.matchCidr(network, srcAddress, mask, 8, expand);
  }

  /**
   * Matches an IPv6 address against a CIDR range
   * @param network - The network portion of the CIDR
   * @param mask - The subnet mask bits
   * @param srcAddress - The source IPv6 address to check
   * @returns True if the address is in the CIDR range, false otherwise
   */
  private static matchIpv6Cidr(network: string, mask: number, srcAddress: string): boolean {
    const expand = (ip: string): number[] => {
      return ip.split(':').map((part) => parseInt(part || '0', 16));
    };
    return this.matchCidr(network, srcAddress, mask, 16, expand);
  }
}
