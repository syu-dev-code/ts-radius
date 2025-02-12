import { waitFor } from '@tests/libs/lib';
import { createSocket, type Socket } from 'dgram';

export class UDPClient {
  private client?: Socket;

  constructor(
    private port: number,
    private host: string
  ) {}

  request(buffer: Buffer): Promise<Buffer> {
    this.client = this.client ?? createSocket('udp4');
    return new Promise((resolve, reject) => {
      this.client?.send(buffer, this.port, this.host, (err) => {
        if (err) {
          reject(err);
        }
        this.client?.once('message', (message) => {
          resolve(message);
        });
      });
    });
  }

  requestWithWaitForDone(buffer: Buffer, done: () => boolean): Promise<void> {
    this.client = this.client ?? createSocket('udp4');
    return new Promise((resolve, reject) => {
      this.client?.send(buffer, this.port, this.host, (err) => {
        if (err) {
          return reject(err);
        }
        this.client?.once('message', (message) => {
          reject(message);
        });
        (async () => {
          while (!done()) await waitFor(1);
          return resolve();
        })();
      });
    });
  }

  close(): Promise<void> {
    if (!this.client) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.client?.close(resolve);
    });
  }
}
