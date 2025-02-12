import type { ILogger } from '@app/logger/ILogger';
import { LOG_ENTRIES } from '@app/logger/LogEntries';
import { logLevel } from '@app/types/Log';

type Log = [code: keyof typeof LOG_ENTRIES, level: logLevel, message: string];

export class MockLogger implements ILogger {
  public logs: Log[] = [];
  log(code: keyof typeof LOG_ENTRIES, level: logLevel, message: string): Promise<void> {
    this.logs.push([code, level, message]);
    return Promise.resolve();
  }

  public getLastLog(): Log {
    return this.logs[this.logs.length - 1] ?? [];
  }

  public getFirstLog(): Log {
    return this.logs[0] ?? [];
  }
}
