import { IDnsResolver } from '@app/lib/dns/IDnsResolver';

export class MemoryDnsResolver implements IDnsResolver {
  private records: { [domain: string]: { A?: string[]; AAAA?: string[] } } = {};

  constructor(records: { [domain: string]: { A?: string[]; AAAA?: string[] } }) {
    this.records = records;
  }

  async resolve(domain: string, recordType: 'A' | 'AAAA'): Promise<string[]> {
    const domainRecords = this.records[domain] ?? false;
    if (domainRecords === false) return [];
    switch (recordType) {
      case 'A':
        return domainRecords.A ?? [];
      case 'AAAA':
        return domainRecords.AAAA ?? [];
    }
  }
}
