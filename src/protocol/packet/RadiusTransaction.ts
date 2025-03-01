import { Logger } from '@app/logger/Logger';
import type { RemoteInfo } from 'dgram';
import type { Disposable } from '@app/types/Disposable';

/**
 * Interface for RADIUS transaction management.
 * Provides methods for acquiring and releasing RADIUS packet transactions
 * to ensure each request is processed exactly once.
 */
export interface RadiusTransaction extends Disposable {
  /**
   * Attempts to acquire a transaction for the RADIUS packet.
   * Returns false if a transaction already exists (duplicate request).
   *
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns True if transaction was acquired, false if duplicate
   */
  acquire(rinfo: RemoteInfo, identifier: number): Promise<boolean>;

  /**
   * Releases the acquired transaction.
   *
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   */
  release(rinfo: RemoteInfo, identifier: number): Promise<void>;
}

/**
 * In-memory implementation of RADIUS transaction.
 * Manages RADIUS packet transactions using identifier-based tracking.
 *
 * TODO: This implementation is not thread-safe or process-safe.
 * When running the RADIUS server with multiple processes or threads,
 * race conditions may occur as this uses in-memory storage
 * without synchronization mechanisms. Consider using a distributed
 * implementation with an external data store for multi-process deployments.
 */
export class MemoryRadiusTransaction implements RadiusTransaction {
  private store: Map<string, Date> = new Map();
  private timer?: NodeJS.Timeout;

  /**
   * Creates a new instance of MemoryRadiusTransaction.
   * @param cleanupInterval - The interval in milliseconds between cleanup operations (default: 5 minutes)
   * @param duplicateTimeout - The time in milliseconds after which a packet is no longer considered a duplicate (default: 5 minutes)
   */
  constructor(
    private readonly cleanupInterval: number = 1000 * 60 * 5,
    private readonly duplicateTimeout: number = 1000 * 30
  ) {
    const cleanUp = async () => {
      try {
        const beforeCleanup = this.store.size;
        await this.clearUpUnused();
        const afterCleanup = this.store.size;
        const cleaned = beforeCleanup - afterCleanup;
        Logger.log('RADIUS_TRANSACTION_CLEANUP_SUCCESS', {
          beforeCleanup,
          afterCleanup,
          cleaned,
        });
      } catch (error) {
        Logger.log('RADIUS_TRANSACTION_CLEANUP_ERROR', { error: `${error}` });
      }
      this.timer = setTimeout(cleanUp, this.cleanupInterval);
    };
    this.timer = setTimeout(cleanUp, this.cleanupInterval);
  }

  /**
   * Generates a unique key for a remote info object and identifier.
   * According to RFC 2865, duplicate detection uses client source IP address,
   * source UDP port and Identifier.
   *
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns A string key in the format "address:port:identifier"
   */
  private generateKey(rinfo: RemoteInfo, identifier: number): string {
    return `${rinfo.address}|${rinfo.port}|${identifier}`;
  }

  /**
   * Attempts to acquire a transaction for the RADIUS packet.
   * Returns false if a transaction already exists (duplicate request).
   *
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns True if transaction was acquired, false if duplicate
   */
  async acquire(rinfo: RemoteInfo, identifier: number): Promise<boolean> {
    const key = this.generateKey(rinfo, identifier);
    const lastAccess = this.store.get(key);

    if (lastAccess !== undefined && lastAccess.getTime() > Date.now() - this.duplicateTimeout) {
      return false; // Already acquired (duplicate packet)
    }

    this.store.set(key, new Date());
    return true; // Successfully acquired
  }

  /**
   * Releases the acquired transaction.
   *
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   */
  async release(rinfo: RemoteInfo, identifier: number): Promise<void> {
    const key = this.generateKey(rinfo, identifier);
    const lastAccess = this.store.get(key);
    if (lastAccess === undefined) {
      return;
    }

    const elapsedTime = Date.now() - lastAccess.getTime();
    const remainingTime = Math.max(0, this.duplicateTimeout - elapsedTime);
    await new Promise((resolve) => setTimeout(resolve, remainingTime));
    this.store.delete(key);
  }

  /**
   * Clears up unused and expired identifiers.
   * This method is called periodically to prevent memory leaks.
   *
   * NOTE: This operation is not atomic and may lead to race conditions
   * in multi-process environments. Concurrent modifications to the store
   * during cleanup could result in inconsistent state.
   */
  async clearUpUnused(): Promise<void> {
    const now = Date.now();
    const expirationTime = now - this.duplicateTimeout;

    // Process each key and remove expired entries
    for (const [key, timestamp] of this.store.entries()) {
      if (timestamp.getTime() < expirationTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Disposes of resources used by this provider.
   * This method should be called when the provider is no longer needed.
   */
  async dispose() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.store.clear();
  }
}
