export class PromiseQueue {
  private readonly concurrency: number;
  private running: number = 0;
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(concurrency: number) {
    this.concurrency = concurrency;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.concurrency) {
      // Create a new promise that will be resolved when a slot becomes available
      return new Promise<T>((resolve, reject) => {
        this.queue.push({ fn, resolve, reject });
      });
    }

    return this.runTask(fn);
  }

  private async runTask<T>(fn: () => Promise<T>): Promise<T> {
    this.running++;
    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      this.processNextTask();
    }
  }

  private processNextTask(): void {
    if (this.queue.length > 0 && this.running < this.concurrency) {
      const next = this.queue.shift();
      if (next) {
        this.runTask(next.fn).then(next.resolve).catch(next.reject);
      }
    }
  }

  getPendingLength(): number {
    return this.running;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
