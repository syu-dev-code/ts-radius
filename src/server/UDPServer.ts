import { createSocket, RemoteInfo, Socket } from 'dgram';
import { IPacketHandler } from '@app/server/handlers/IPacketHandler';
import { Logger } from '@app/logger/Logger';

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

    this.server = await this.setup()
      .then((server) => {
        Logger.log('SERVER_ON_START_SUCCESS', { port: this.port, host: this.host });
        return server;
      })
      .catch((error) => {
        Logger.log('SERVER_ON_START_FAILED', {
          port: this.port,
          host: this.host,
          error: `${error}`,
        });
        throw error;
      });
  }

  private setup(): Promise<Socket> {
    return new Promise<Socket>((resolve, reject) => {
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
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Server is not running');
    }
    await this.handler.onStop();
    return new Promise<void>((resolve) => {
      this.server?.close(resolve);
    }).then(() => {
      this.server = null;
      Logger.log('SERVER_ON_STOP', {});
    });
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
