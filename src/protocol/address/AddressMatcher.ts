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
    return this.matchDnsAddress(settingAddress, srcAddress);
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
   * @param settingAddress - The domain name to resolve
   * @param srcAddress - The source IP address to check
   * @returns True if the resolved address matches, false otherwise
   */
  private static async matchDnsAddress(
    settingAddress: string,
    srcAddress: string
  ): Promise<boolean> {
    try {
      const addresses = await dns.resolve(settingAddress);
      return addresses.includes(srcAddress);
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

  /**
   * Matches an IPv4 address against a CIDR range
   * @param network - The network portion of the CIDR
   * @param mask - The subnet mask bits
   * @param srcAddress - The source IPv4 address to check
   * @returns True if the address is in the CIDR range, false otherwise
   */
  private static matchIpv4Cidr(network: string, mask: number, srcAddress: string): boolean {
    const networkBits = network.split('.').map((n) => parseInt(n, 10));
    const srcBits = srcAddress.split('.').map((n) => parseInt(n, 10));

    const maskOctets = Math.floor(mask / 8);
    const remainingBits = mask % 8;

    for (let i = 0; i < maskOctets; i++) {
      if (networkBits[i] !== srcBits[i]) return false;
    }

    if (remainingBits > 0) {
      const maskByte = 256 - (1 << (8 - remainingBits));
      if ((networkBits[maskOctets] & maskByte) !== (srcBits[maskOctets] & maskByte)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Matches an IPv6 address against a CIDR range
   * @param network - The network portion of the CIDR
   * @param mask - The subnet mask bits
   * @param srcAddress - The source IPv6 address to check
   * @returns True if the address is in the CIDR range, false otherwise
   */
  private static matchIpv6Cidr(network: string, mask: number, srcAddress: string): boolean {
    const expandIPv6 = (ip: string): number[] => {
      return ip
        .split(':')
        .map((part) => part || '0')
        .map((part) => parseInt(part, 16));
    };

    const networkBits = expandIPv6(network);
    const srcBits = expandIPv6(srcAddress);

    const maskWords = Math.floor(mask / 16);
    const remainingBits = mask % 16;

    for (let i = 0; i < maskWords; i++) {
      if (networkBits[i] !== srcBits[i]) return false;
    }

    if (remainingBits > 0) {
      const maskWord = 65536 - (1 << (16 - remainingBits));
      if ((networkBits[maskWords] & maskWord) !== (srcBits[maskWords] & maskWord)) {
        return false;
      }
    }

    return true;
  }
}
