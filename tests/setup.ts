import { Logger } from '@app/logger/Logger';
import { MockLogger } from '@tests/__mocks/MockLogger';

beforeEach(async () => {
  const mockLogger = new MockLogger();
  Logger.setDelegate(mockLogger);

  const settings = {
    UDP: {
      port: 49152,
      address: '127.0.0.1',
    },
    mockLogger,
  };

  global = { ...global, ...settings };
});
