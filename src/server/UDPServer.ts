import { createSocket, RemoteInfo, Socket } from 'dgram';
import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { Logger } from '@app/logger/Logger';
import { withResolvers } from '@app/lib/Promise.withResolvers';

export class UDPServer {
  private server: Socket | null = null;

  get isRunning(): boolean {
    return this.server !== null;
  }

  constructor(
    private port: number,
    private host: string,
    private handler: IPacketHandler
  ) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }

    try {
      this.server = await this.setup();
      Logger.log('SERVER_ON_START_SUCCESS', { port: this.port, host: this.host });
    } catch (error) {
      Logger.log('SERVER_ON_START_FAILED', { port: this.port, host: this.host, error: `${error}` });
      throw error;
    }
  }

  private setup(): Promise<Socket> {
    const { promise: setupPromise, resolve, reject } = withResolvers<Socket>();

    const server = createSocket('udp4');
    const onListening = () => {
      server.removeListener('error', onError);
      server.on('message', this.onMessage.bind(this));
      server.on('error', (error) => {
        Logger.log('SERVER_ON_UNHANDLE_ERROR', { error: `${error}` });
      });
      resolve(server);
    };
    const onError = (error: Error) => {
      server.removeListener('listening', onListening);
      server.close(() => reject(error));
    };
    server.once('listening', onListening);
    server.once('error', onError);
    server.bind(this.port, this.host);

    return setupPromise;
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Server is not running');
    }
    await this.handler.dispose();

    const { promise: stopPromise, resolve } = withResolvers<void>();
    this.server?.close(resolve);
    await stopPromise;
    this.server = null;
    Logger.log('SERVER_ON_STOP', {});
  }

  private async onMessage(buffer: Buffer, rinfo: RemoteInfo) {
    try {
      const response = await this.handler.handle(buffer, rinfo);
      if (response === null) {
        return;
      }
      this.server?.send(response, rinfo.port, rinfo.address, (error) => {
        if (error !== null) {
          Logger.log('SERVER_ON_SEND_PACKET_ERROR', { ...rinfo, error: `${error}` });
        }
      });
    } catch (error: unknown) {
      Logger.log('SERVER_ON_HANDLE_PACKET_ERROR', { ...rinfo, error: `${error}` });
    }
  }
}
