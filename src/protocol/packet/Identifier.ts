import { Logger } from '@app/logger/Logger';
import type { RemoteInfo } from 'dgram';
import type { Disposable } from '@app/types/Disposable';
/**
 * In-memory implementation of the identifier provider.
 * Manages packet identifiers and provides duplicate detection.
 *
 * TODO: This implementation is not thread-safe or process-safe.
 * When running the RADIUS server with multiple processes or threads,
 * race conditions may occur as this provider uses in-memory storage
 * without synchronization mechanisms. Consider using a distributed
 * identifier provider with an external data store (Redis, MongoDB, etc.)
 * for multi-process deployments.
 */
export class MemoryIdentifierProvider implements IIdentifierProvider {
  private store: Map<string, Date> = new Map();
  private timer?: NodeJS.Timeout;

  /**
   * Creates a new instance of MemoryIdentifierProvider.
   * @param cleanupInterval - The interval in milliseconds between cleanup operations (default: 5 minutes)
   * @param duplicateTimeout - The time in milliseconds after which a packet is no longer considered a duplicate (default: 5 minutes)
   */
  constructor(
    private readonly cleanupInterval: number = 1000 * 60 * 5,
    private readonly duplicateTimeout: number = 1000 * 5
  ) {
    const cleanUp = async () => {
      try {
        const beforeCleanup = this.store.size;
        await this.clearUpUnused();
        const afterCleanup = this.store.size;
        const cleaned = beforeCleanup - afterCleanup;
        Logger.log('RADIUS_IDENTIFIER_CLEANUP_SUCCESS', {
          beforeCleanup,
          afterCleanup,
          cleaned,
        });
      } catch (error) {
        // TODO: Log error
        Logger.log('RADIUS_IDENTIFIER_CLEANUP_ERROR', { error: `${error}` });
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
   * Checks if a packet is a duplicate and sets the identifier if not.
   *
   * NOTE: This method is not atomic and may lead to race conditions in multi-process environments.
   * Multiple processes could check for duplicates simultaneously and both determine the packet
   * is not a duplicate, leading to duplicate processing.
   *
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns True if the packet is not a duplicate and was successfully set, false if it's a duplicate
   */
  async checkAndSet(rinfo: RemoteInfo, identifier: number): Promise<boolean> {
    const key = this.generateKey(rinfo, identifier);

    // Get the current state
    const lastAccess = this.store.get(key);

    // Duplicate check
    if (lastAccess !== undefined && lastAccess.getTime() > Date.now() - this.duplicateTimeout) {
      return false; // Duplicate packet
    }

    // Set the identifier
    this.store.set(key, new Date());
    return true; // Not a duplicate
  }

  /**
   * Gets the last access time for a packet identifier.
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns The last access time as a Date object, or null if not found
   */
  async get(rinfo: RemoteInfo, identifier: number): Promise<Date | null> {
    const key = this.generateKey(rinfo, identifier);
    return this.store.get(key) ?? null;
  }

  /**
   * Sets a packet identifier with the current timestamp.
   *
   * NOTE: This operation is not atomic and may lead to race conditions
   * in multi-process environments.
   *
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns The packet identifier
   */
  async set(rinfo: RemoteInfo, identifier: number): Promise<number> {
    const key = this.generateKey(rinfo, identifier);
    this.store.set(key, new Date());
    return identifier;
  }

  /**
   * Checks if a packet identifier exists.
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns True if the identifier exists, false otherwise
   */
  async has(rinfo: RemoteInfo, identifier: number): Promise<boolean> {
    const key = this.generateKey(rinfo, identifier);
    return this.store.has(key);
  }

  /**
   * Removes a packet identifier after waiting for the duplicate timeout period.
   * This ensures that duplicate packets can still be detected during the timeout period.
   *
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   */
  async remove(rinfo: RemoteInfo, identifier: number): Promise<void> {
    const key = this.generateKey(rinfo, identifier);

    // Check if the entry exists (for calculating wait time)
    const lastAccess = this.store.get(key);
    if (lastAccess === undefined) {
      return; // Do nothing if the entry doesn't exist
    }

    // Calculate elapsed time since last access
    const elapsedTime = Date.now() - lastAccess.getTime();
    const remainingTime = Math.max(0, this.duplicateTimeout - elapsedTime);

    // Wait for the remaining time
    await new Promise((resolve) => setTimeout(resolve, remainingTime));

    // Delete the entry after waiting (safe even if the entry no longer exists)
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

/**
 * Interface for identifier providers.
 * Defines methods for managing packet identifiers and detecting duplicates.
 */
export interface IIdentifierProvider extends Disposable {
  /**
   * Gets the last access time for a packet identifier.
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns The last access time as a Date object, or null if not found
   */
  get(rinfo: RemoteInfo, identifier: number): Promise<Date | null>;

  /**
   * Sets a packet identifier with the current timestamp.
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns The packet identifier
   */
  set(rinfo: RemoteInfo, identifier: number): Promise<number>;

  /**
   * Checks if a packet identifier exists.
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns True if the identifier exists, false otherwise
   */
  has(rinfo: RemoteInfo, identifier: number): Promise<boolean>;

  /**
   * Removes a packet identifier.
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   */
  remove(rinfo: RemoteInfo, identifier: number): Promise<void>;

  /**
   * Atomically checks if a packet is a duplicate and sets the identifier if not.
   * @param rinfo - The remote info object
   * @param identifier - The packet identifier
   * @returns True if the packet is not a duplicate and was successfully set, false if it's a duplicate
   */
  checkAndSet(rinfo: RemoteInfo, identifier: number): Promise<boolean>;
}
