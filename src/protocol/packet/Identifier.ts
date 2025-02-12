import type { RemoteInfo } from 'dgram';

export class Identifier {
  private provider: IIdentifierProvider;
  constructor(provider: IIdentifierProvider) {
    this.provider = provider;
  }
}

export class MemoryIdentifierProvider implements IIdentifierProvider {
  private store: Map<string, Map<number, Date>> = new Map();

  generateKey(rinfo: RemoteInfo): string {
    return `${rinfo.address}:${rinfo.port}`;
  }

  set(rinfo: RemoteInfo, id: number): number {
    const key = this.generateKey(rinfo);
    let ids = this.store.get(key);
    if (ids === undefined) {
      ids = new Map<number, Date>();
      this.store.set(key, ids);
    }
    ids.set(id, new Date());
    return id;
  }

  has(rinfo: RemoteInfo, id: number): boolean {
    const key = this.generateKey(rinfo);
    return this.store.get(key)?.has(id) ?? false;
  }

  remove(rinfo: RemoteInfo, id: number): void {
    const key = this.generateKey(rinfo);
    this.store.get(key)?.delete(id);
  }

  clear(rinfo: RemoteInfo): void {
    const key = this.generateKey(rinfo);
    this.store.delete(key);
  }

  getAll(): { id: number; createdAt: Date }[] {
    return Array.from(this.store.values())
      .flatMap((ids) => Array.from(ids.entries()))
      .map(([id, createdAt]) => ({ id, createdAt }));
  }
}

interface IIdentifierProvider {
  has(rinfo: RemoteInfo, id: number): boolean;
  set(rinfo: RemoteInfo, id: number): number;
  remove(rinfo: RemoteInfo, id: number): void;
  clear(rinfo: RemoteInfo): void;
}
