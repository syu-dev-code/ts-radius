import type { RemoteInfo } from 'dgram';
import { NAS } from '@app/protocol/nas/NAS';

export interface INasProvider {
  getNas(address: RemoteInfo['address']): Promise<NAS | null>;
}
