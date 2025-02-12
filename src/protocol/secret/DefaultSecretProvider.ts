import type { RemoteInfo } from 'dgram';
import { ISecretProvider } from '@app/protocol/secret/ISecretProvider';

export class DefaultSecretProvider implements ISecretProvider {
  constructor(private map: { [key: string]: string } = {}) {}

  async getSecret(address: RemoteInfo['address']): Promise<string | null> {
    return this.map[address] ?? null;
  }

  async setSecret(address: RemoteInfo['address'], secret: string): Promise<void> {
    this.map[address] = secret;
  }
}
