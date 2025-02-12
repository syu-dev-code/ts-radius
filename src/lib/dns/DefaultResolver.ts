import dns from 'dns/promises';
import { IDnsResolver } from '@app/lib/dns/IDnsResolver';

export class DefaultResolver implements IDnsResolver {
  private readonly dns: dns.Resolver = new dns.Resolver();

  constructor() {}

  async resolve(domain: string, recordType: 'A' | 'AAAA'): Promise<string[]> {
    switch (recordType) {
      case 'A':
        return this.dns.resolve4(domain);
      case 'AAAA':
        return this.dns.resolve6(domain);
    }
  }
}
