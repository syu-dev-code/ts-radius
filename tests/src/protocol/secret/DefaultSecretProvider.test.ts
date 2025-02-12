import { DefaultSecretProvider } from '@app/protocol/secret/DefaultSecretProvider';

describe('@app/protocol/secret/DefaultSecretProvider', () => {
  it('should be able to load a secret from a file', async () => {
    const provider = new DefaultSecretProvider({
      '127.0.0.1': 'secret',
    });
    const secret = await provider.getSecret('127.0.0.1');
    expect(secret).toBe('secret');
  });

  it('should return null if the secret is not found', async () => {
    const provider = new DefaultSecretProvider();
    const secret = await provider.getSecret('127.0.0.1');
    expect(secret).toBeNull();
  });

  it('should be able to set a secret', async () => {
    const provider = new DefaultSecretProvider();
    await provider.setSecret('127.0.0.1', 'secret');
    const secret = await provider.getSecret('127.0.0.1');
    expect(secret).toBe('secret');
  });
});
