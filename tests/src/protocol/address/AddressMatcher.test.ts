import { AddressMatcher } from '@app/protocol/address/AddressMatcher';
import dns from 'dns/promises';

jest.mock('dns/promises', () => ({
  resolve: jest.fn(),
}));

describe('@app/protocol/address/AddressMatcher', () => {
  describe('matchIpAddress', () => {
    it('should return true when addresses match exactly', async () => {
      const result = await AddressMatcher.matchIpAddress('192.168.1.1', '192.168.1.1');
      expect(result).toBe(true);
    });

    it('should handle CIDR notation addresses', async () => {
      const result = await AddressMatcher.matchIpAddress('192.168.1.0/24', '192.168.1.1');
      expect(result).toBe(true);
    });

    it('should return true when DNS resolution succeeds', async () => {
      (dns.resolve as jest.Mock).mockResolvedValueOnce(['192.168.1.1']);
      const result = await AddressMatcher.matchIpAddress('example.com', '192.168.1.1');
      expect(result).toBe(true);
    });

    it('should return false when DNS resolution fails', async () => {
      (dns.resolve as jest.Mock).mockRejectedValueOnce(new Error('DNS resolution failed'));
      const result = await AddressMatcher.matchIpAddress('invalid.example.com', '192.168.1.1');
      expect(result).toBe(false);
    });
  });

  describe('matchIpv4Address', () => {
    it('should return false when source address is not IPv4', () => {
      const result = AddressMatcher.matchIpv4Address('192.168.1.1', '2001:db8::1');
      expect(result).toBe(false);
    });

    it('should return true when setting address is wildcard', () => {
      const result = AddressMatcher.matchIpv4Address('*', '192.168.1.1');
      expect(result).toBe(true);
    });

    it('should return true when addresses match exactly', () => {
      const result = AddressMatcher.matchIpv4Address('192.168.1.1', '192.168.1.1');
      expect(result).toBe(true);
    });

    it('should return false when addresses do not match', () => {
      const result = AddressMatcher.matchIpv4Address('192.168.1.1', '192.168.1.2');
      expect(result).toBe(false);
    });
  });

  describe('matchIpv6Address', () => {
    it('should return false when source address is not IPv6', () => {
      const result = AddressMatcher.matchIpv6Address('2001:db8::1', '192.168.1.1');
      expect(result).toBe(false);
    });

    it('should return true when setting address is wildcard', () => {
      const result = AddressMatcher.matchIpv6Address('*', '2001:db8::1');
      expect(result).toBe(true);
    });

    it('should return true when addresses match exactly', () => {
      const result = AddressMatcher.matchIpv6Address('2001:db8::1', '2001:db8::1');
      expect(result).toBe(true);
    });

    it('should return false when addresses do not match', () => {
      const result = AddressMatcher.matchIpv6Address('2001:db8::1', '2001:db8::2');
      expect(result).toBe(false);
    });
  });

  describe('matchCidrAddress', () => {
    it('should return true for IPv4 address within CIDR range', () => {
      const result = AddressMatcher['matchCidrAddress']('192.168.1.0/24', '192.168.1.1');
      expect(result).toBe(true);
    });

    it('should return false for IPv4 address outside CIDR range', () => {
      const result = AddressMatcher['matchCidrAddress']('192.168.1.0/24', '192.168.2.1');
      expect(result).toBe(false);
    });

    it('should return true for IPv6 address within CIDR range', () => {
      const result = AddressMatcher['matchCidrAddress']('2001:db8::/32', '2001:db8::1');
      expect(result).toBe(true);
    });

    it('should return false for IPv6 address outside CIDR range', () => {
      const result = AddressMatcher['matchCidrAddress']('2001:db8::/32', '2001:db9::1');
      expect(result).toBe(false);
    });

    it('should handle IPv4 CIDR with partial octet mask', () => {
      // mask = 28 (3 octets + 4 bits)
      const result1 = AddressMatcher['matchCidrAddress']('192.168.1.16/28', '192.168.1.17');
      expect(result1).toBe(true);

      const result2 = AddressMatcher['matchCidrAddress']('192.168.1.16/28', '192.168.1.32');
      expect(result2).toBe(false);
    });

    it('should handle IPv6 CIDR with partial word mask', () => {
      // mask = 36 (2 words + 4 bits)
      const result1 = AddressMatcher['matchCidrAddress'](
        '2001:db8:1000::/36',
        '2001:db8:1000:0:0:0:0:1'
      );
      expect(result1).toBe(true);

      const result2 = AddressMatcher['matchCidrAddress']('2001:db8:1000::/36', '2001:db8:2000::1');
      expect(result2).toBe(false);
    });

    it('should handle IPv4 CIDR with byte-aligned mask', () => {
      const result1 = AddressMatcher['matchCidrAddress']('192.168.0.0/16', '192.168.1.1');
      expect(result1).toBe(true);

      const result2 = AddressMatcher['matchCidrAddress']('192.168.0.0/16', '192.169.1.1');
      expect(result2).toBe(false);
    });

    it('should handle IPv6 CIDR with word-aligned mask', () => {
      const result1 = AddressMatcher['matchCidrAddress']('2001:db8::/32', '2001:db8:1::1');
      expect(result1).toBe(true);

      const result2 = AddressMatcher['matchCidrAddress']('2001:db8::/32', '2001:db9::1');
      expect(result2).toBe(false);
    });
  });
});
