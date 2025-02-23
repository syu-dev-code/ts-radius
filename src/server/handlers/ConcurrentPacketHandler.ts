import { Logger } from '@app/logger/Logger';
import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import type { RemoteInfo } from 'dgram';
import PromiseQueue from 'promise-queue';

export class ConcurrentPacketHandler implements IPacketHandler {
  /**
   * @description The queue of packets to be processed.
   */
  private queue: PromiseQueue;

  /**
   * @description The delegate to handle the packets.
   */
  private delegate: IPacketHandler;

  /**
   * @description The timeout for the handler to stop. (in milliseconds)
   * If the handler does not stop within the timeout, it will be forcibly stopped.
   */
  private timeoutOnStop: number;

  /**
   * @description Whether the handler is locked.
   * If true, the handler will not process and discard any packets, otherwise it will process the packets.
   */
  private isQueueLocked: boolean = false;

  constructor(concurrency: number, delegate: IPacketHandler, timeoutOnStop: number = 10000) {
    this.queue = new PromiseQueue(concurrency, Number.POSITIVE_INFINITY);
    this.delegate = delegate;
    this.timeoutOnStop = timeoutOnStop;
  }

  async handle(buffer: Buffer, rinfo: RemoteInfo): Promise<Buffer | null> {
    if (this.isQueueLocked) {
      return null;
    }
    return this.queue.add(() => this.delegate.handle(buffer, rinfo));
  }

  /**
   * @description Whether the queue is empty.
   * @returns Whether the queue is empty.
   */
  private isEmpty(): boolean {
    return this.queue.getPendingLength() === 0 && this.queue.getQueueLength() === 0;
  }

  public async onStop(): Promise<void> {
    // Lock the handler to prevent new packets from being processed
    this.isQueueLocked = true;
    // Wait for the queue to empty or the timeout to expire
    await new Promise<void>((resolve) => {
      const clearup = async (isTimeout: boolean) => {
        if (isTimeout) {
          await Logger.log('CONCURRENT_PACKET_HANDLER_ON_STOP_TIMEOUT', {});
        }
        clearInterval(pollingTimer);
        clearTimeout(timeoutTimer);
        resolve();
      };
      // Poll the queue to check if it's empty
      const pollingTimer = setInterval(async () => {
        if (this.isEmpty()) {
          return await clearup(false);
        }
      }, 100);
      // Set a timeout to stop the handler if the queue doesn't empty within the timeout
      const timeoutTimer = setTimeout(() => clearup(true), this.timeoutOnStop);
    });
    // Wait for the delegate to stop
    await this.delegate.onStop();

    // NOTE: Not unlocking the handler here, because it's not safe to do so.
  }
}
