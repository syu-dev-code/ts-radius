import { LOG_ENTRIES } from '@app/logger/LogEntries';
import { ProxyLogger } from '@app/logger/Logger';
import { CustomLogEntry } from '@app/types/Log';
import { MockLogger } from '@tests/__mocks/MockLogger';

describe('@app/logger/Logger', () => {
  const TEST_ENTRY_KEY = '__TEST_ENTRY_@app/logger/Logger.test.ts' as const;

  it('should not log if no delegate is set', async () => {
    const delegate = new MockLogger();
    const logger = new ProxyLogger(LOG_ENTRIES);
    await logger.log('SERVER_ON_START_SUCCESS', { host: 'localhost', port: 1234 });
    const [code, level, message] = delegate.getLastLog();

    expect(code).toBeUndefined();
    expect(level).toBeUndefined();
    expect(message).toBeUndefined();
  });

  it('should log if delegate is set', async () => {
    const delegate = new MockLogger();
    const logger = new ProxyLogger(LOG_ENTRIES);
    logger.setDelegate(delegate);
    await logger.log('SERVER_ON_START_SUCCESS', { host: 'localhost', port: 1234 });
    const [code, level, message] = delegate.getLastLog();
    const lastLog = {
      code,
      level,
      message,
    };
    expect(lastLog).toEqual({
      code: 'SERVER_ON_START_SUCCESS',
      ...LOG_ENTRIES.SERVER_ON_START_SUCCESS,
    });
  });

  it('should extend log entries', async () => {
    const CUSTOM_ENTRIES = {
      [TEST_ENTRY_KEY]: {
        level: 'crit',
        message: 'Test message ${param}',
      },
    } as const satisfies CustomLogEntry;
    const logger = new ProxyLogger(LOG_ENTRIES);
    const delegate = new MockLogger();
    logger.setDelegate(delegate);

    const extendedLogger = logger.extend(CUSTOM_ENTRIES);
    const entries = Reflect.get(extendedLogger, 'entries');
    expect(entries).toEqual({
      ...LOG_ENTRIES,
      ...CUSTOM_ENTRIES,
    });

    const extendedDelegate = Reflect.get(extendedLogger, 'delegate');
    expect(extendedDelegate).toBe(delegate);

    await extendedLogger.log(TEST_ENTRY_KEY, { param: 'param' });
    const [code, level, message] = delegate.getLastLog();
    expect(code).toBe(TEST_ENTRY_KEY);
    expect(level).toBe('crit');
    expect(message).toBe('Test message param');
  });

  it('If delegate is not set, extended logger should not set delegate', async () => {
    const CUSTOM_ENTRIES = {} as const satisfies CustomLogEntry;
    const logger = new ProxyLogger(LOG_ENTRIES);
    const extendedLogger = logger.extend(CUSTOM_ENTRIES);
    const delegate = Reflect.get(extendedLogger, 'delegate');
    expect(delegate).toBeUndefined();
  });
});
