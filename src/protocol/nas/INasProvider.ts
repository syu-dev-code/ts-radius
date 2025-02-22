import type { RemoteInfo } from 'dgram';
import { NAS } from './NAS';

export interface INasProvider {
  getNas(address: RemoteInfo['address']): Promise<NAS | null>;
}
