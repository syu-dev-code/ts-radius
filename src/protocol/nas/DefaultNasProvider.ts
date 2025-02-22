import { RemoteInfo } from 'dgram';
import { NAS, NASConfig } from './NAS';
import { INasProvider } from './INasProvider';

export class DefaultNasProvider implements INasProvider {
  private store: NAS[] = [];

  constructor(nasConfig: NASConfig[]) {
    this.store = nasConfig.map((config) => new NAS(config));
  }

  async getNas(address: RemoteInfo['address']): Promise<NAS | null> {
    return this.store.find((nas) => nas.match(address)) ?? null;
  }
}
