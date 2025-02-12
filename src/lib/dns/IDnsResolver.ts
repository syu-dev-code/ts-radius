export interface IDnsResolver {
  resolve(domain: string, recordType: 'A' | 'AAAA'): Promise<string[]>;
}
