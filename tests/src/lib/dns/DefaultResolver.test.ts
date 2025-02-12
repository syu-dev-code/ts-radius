import { DefaultResolver } from '@app/lib/dns/DefaultResolver';

describe('@app/lib/dns/DefaultResolver', () => {
  it('', async () => {
    const resolver = new DefaultResolver();
    const actual = await resolver.resolve('localhost', 'A');
    expect(actual).toContain('127.0.0.1');
  });

  it('should resolve at least one AAAA record for localhost', async () => {
    const resolver = new DefaultResolver();
    const actual = await resolver.resolve('localhost', 'AAAA');
    expect(actual).toContain('::1');
  });
});
