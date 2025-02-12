import { logLevel } from '@app/types/Log';

export interface ILogger {
  log(code: string, level: logLevel, message: string): Promise<void>;
}
