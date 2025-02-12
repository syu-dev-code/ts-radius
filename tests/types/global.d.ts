import { MockLogger } from '@tests/__mocks/MockLogger';

declare global {
  var mockLogger: MockLogger;
  var UDP: {
    readonly port: number;
    readonly address: string;
  };
}

export {};
