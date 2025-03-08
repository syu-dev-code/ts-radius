import { RemoteInfo } from 'dgram';
import { NAS, NASConfig } from '@app/protocol/nas/NAS';
import { INasProvider } from '@app/protocol/nas/INasProvider';

export class DefaultNasProvider implements INasProvider {
  private store: NAS[] = [];

  constructor(nasConfig: NASConfig[]) {
    this.store = nasConfig.map((config) => new NAS(config));
  }

  async getNas(address: RemoteInfo['address']): Promise<NAS | null> {
    const matchPromises = this.store.map(async (nas) => {
      const matched = await nas.match(address);
      return matched ? nas : Promise.reject();
    });
    return Promise.any(matchPromises).catch(() => null);
  }
}
