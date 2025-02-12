import type { RemoteInfo } from 'dgram';
import fs from 'fs/promises';
import { ISecretProvider } from '@app/protocol/secret/ISecretProvider';

export class JsonFileSecretProvider implements ISecretProvider {
  private readonly filePath: string;
  private cache: { [key: string]: string } = {};

  private constructor(filePath: string) {
    this.filePath = filePath;
  }

  static async create(filePath: string): Promise<JsonFileSecretProvider> {
    const provider = new this(filePath);
    await provider.loadSecrets();
    return provider;
  }

  private async loadSecrets(): Promise<void> {
    const json = await fs.readFile(this.filePath, {
      encoding: 'utf8',
      flag: 'r',
    });
    this.cache = JSON.parse(json);
  }

  async getSecret(address: RemoteInfo['address']): Promise<string | null> {
    return this.cache[address] ?? null;
  }

  async setSecret(address: RemoteInfo['address'], secret: string): Promise<void> {
    this.cache[address] = secret;
    await fs.writeFile(this.filePath, JSON.stringify(this.cache, null, 2), {
      encoding: 'utf8',
      flag: 'w',
    });
  }
}
