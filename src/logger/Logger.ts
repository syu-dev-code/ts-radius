import type {
  BaseLogEntry,
  DefaultLogEntry,
  ExtendedLogger,
  LevelFor,
  MessageFor,
  ParamsFor,
} from '@app/types/Log';
import type { ILogger } from '@app/logger/ILogger';
import { LOG_ENTRIES } from './LogEntries';
import { replacePlaceHolder } from './replacePlaceHolder';

export class ProxyLogger<T extends BaseLogEntry = DefaultLogEntry> {
  private delegate?: ILogger;

  constructor(private entries: T) {}

  async log<
    C extends Extract<keyof T, string>,
    // NOTE: For IDE to check the log level
    _ extends LevelFor<T, C>,
    // NOTE: For IDE to check the message
    __ extends MessageFor<T, C>,
  >(code: C, params: ParamsFor<T, C>): Promise<void> {
    const entry = this.entries[code];
    const level = entry.level;
    const message = replacePlaceHolder(entry.message, params);
    return this.delegate?.log(code, level, message) ?? Promise.resolve();
  }

  /**
   * @returns **NOTE: Returns `never` if there are duplicate keys between new entries and existing entries.**
   */
  extend<E extends BaseLogEntry>(entries: E): ExtendedLogger<T, E> {
    const newLogger = new ProxyLogger({ ...this.entries, ...entries }) as ExtendedLogger<T, E>;
    if (this.delegate) {
      newLogger.setDelegate(this.delegate);
    }
    return newLogger;
  }

  setDelegate(delegate: ILogger): void {
    this.delegate = delegate;
  }
}

export const Logger = new ProxyLogger(LOG_ENTRIES);
