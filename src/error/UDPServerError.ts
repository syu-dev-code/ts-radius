import { Socket } from 'dgram';

export class UDPServerError extends Error {
  constructor(
    message: string,
    private readonly server: Socket
  ) {
    super(message);
    this.name = UDPServerError.name;
  }
  tryToClose() {
    this.server.close();
  }
}
