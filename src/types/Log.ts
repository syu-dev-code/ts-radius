import type { LOG_ENTRIES } from '@app/logger/LogEntries';
import type { ProxyLogger } from '@app/logger/Logger';
import type { Expand, Printable } from '@app/types/Utils';

export type BaseLogEntry = {
  [code: string]: {
    level: logLevel;
    message: string;
  };
};

export type DefaultLogEntry = typeof LOG_ENTRIES;
export type CustomLogEntry = BaseLogEntry;
export type CombinedLogEntry = DefaultLogEntry & CustomLogEntry;

/**
 * @description Log levels\
 * `emerg`: Used when a catastrophic issue occurs that makes the system unusable. This includes situations where the entire system crashes or completely stops functioning.\
 * `alert`: Reports issues that require immediate attention. These are situations where the service may stop functioning, requiring urgent action.\
 * `crit`: Used when a critical error occurs in the system or application, but it does not completely stop the system. It warns of potential instability.\
 * `err`: General errors. These affect the application's operation but do not require immediate fixes for the system to continue running.\
 * `warning`: Warnings. These indicate potential issues, but there is no immediate problem. They are used to draw attention.\
 * `notice`: Used to log information that is not an issue but should be noted. For example, notifications of normal operations.\
 * `info`: Used for logging normal operational information and events. These indicate expected behavior without anomalies.\
 * `debug`: Detailed log information for development and debugging. These are not errors or warnings but are used to track code behavior for developers.
 */
export type logLevel = 'emerg' | 'alert' | 'crit' | 'err' | 'warning' | 'notice' | 'info' | 'debug';
export type LogEntryAsConst = typeof LOG_ENTRIES;
export type LogCodes = keyof LogEntryAsConst;
export type MessageFor<T extends BaseLogEntry, C extends keyof T> = T[C]['message'];
export type LevelFor<T extends BaseLogEntry, C extends keyof T> = T[C]['level'];
export type ParamsFor<T extends BaseLogEntry, C extends keyof T> = Expand<{
  [K in ExtractPlaceholders<MessageFor<T, C>>]: Printable;
}>;
export type ExtractPlaceholders<T extends string> =
  T extends `${infer _Pre}$${'{'}${infer Key}${'}'}${infer Rest}`
    ? Key extends string
      ? Key | ExtractPlaceholders<Rest>
      : never
    : never;
export type ExtendedLogger<T extends BaseLogEntry, E extends BaseLogEntry> = keyof T &
  keyof E extends never
  ? ProxyLogger<T & E>
  : never;
