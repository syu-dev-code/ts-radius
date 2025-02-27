import type { RemoteInfo } from 'dgram';

export class MemoryIdentifierProvider implements IIdentifierProvider {
  private store: Map<string, Map<number, Date>> = new Map();

  private generateKey(rinfo: RemoteInfo): string {
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
}

interface IIdentifierProvider {
  set(rinfo: RemoteInfo, id: number): number;
  has(rinfo: RemoteInfo, id: number): boolean;
  remove(rinfo: RemoteInfo, id: number): void;
  clear(rinfo: RemoteInfo): void;
}
