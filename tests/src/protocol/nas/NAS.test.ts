import { NAS, NASConfig } from '@app/protocol/nas/NAS';
import { AddressMatcher } from '@app/protocol/address/AddressMatcher';

// Mock the AddressMatcher
jest.mock('@app/protocol/address/AddressMatcher');

describe('@app/protocol/nas/NAS', () => {
  // Default configuration for testing
  const defaultConfig: NASConfig = {
    shortName: 'test-nas',
    address: {
      value: '192.168.1.1',
      type: 'ipv4addr',
    },
    secret: 'test-secret',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('match', () => {
    it('should return true when IP address matches', async () => {
      const nas = new NAS(defaultConfig);
      const srcAddress = '192.168.1.1';

      (AddressMatcher.matchIpv4Address as jest.Mock).mockResolvedValue(true);

      const result = await nas.match(srcAddress);
      expect(result).toBe(true);
      expect(AddressMatcher.matchIpv4Address).toHaveBeenCalledWith('192.168.1.1', srcAddress);
    });

    it('should return false when IP address does not match', async () => {
      const nas = new NAS(defaultConfig);
      const srcAddress = '192.168.1.2';

      (AddressMatcher.matchIpv4Address as jest.Mock).mockResolvedValue(false);

      const result = await nas.match(srcAddress);
      expect(result).toBe(false);
    });

    it('should correctly match IPv6 addresses', async () => {
      const config: NASConfig = {
        ...defaultConfig,
        address: {
          value: '2001:db8::1',
          type: 'ipv6addr',
        },
      };
      const nas = new NAS(config);
      const srcAddress = '2001:db8::1';

      (AddressMatcher.matchIpv6Address as jest.Mock).mockResolvedValue(true);

      const result = await nas.match(srcAddress);
      expect(result).toBe(true);
      expect(AddressMatcher.matchIpv6Address).toHaveBeenCalledWith('2001:db8::1', srcAddress);
    });

    it('should correctly match any IP address type including CIDR', async () => {
      const config: NASConfig = {
        ...defaultConfig,
        address: {
          value: '192.168.1.0/24',
          type: 'ipaddr',
        },
      };
      const nas = new NAS(config);
      const srcAddress = '192.168.1.100';

      (AddressMatcher.matchIpAddress as jest.Mock).mockResolvedValue(true);

      const result = await nas.match(srcAddress);
      expect(result).toBe(true);
      expect(AddressMatcher.matchIpAddress).toHaveBeenCalledWith('192.168.1.0/24', srcAddress);
    });
  });
});
