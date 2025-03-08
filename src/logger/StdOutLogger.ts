import { logLevel } from '@app/types/Log';
import { ILogger } from '@app/logger/ILogger';

export class StdOutLogger implements ILogger {
  async log(code: string, level: logLevel, message: string): Promise<void> {
    const log = `${new Date().toISOString()}: ${level.toUpperCase()}: [${code}] ${message}\n`;
    return new Promise<void>((resolve) => {
      switch (level) {
        case 'emerg':
        case 'alert':
        case 'crit':
        case 'err':
          return process.stderr.write(log, () => resolve());
        default:
          return process.stdout.write(log, () => resolve());
      }
    });
  }
}
