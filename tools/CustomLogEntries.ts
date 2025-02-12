import { CustomLogEntry } from '@app/types/Log';
import { Logger } from '@app/logger/Logger';

const CUSTOM_ENTRIES = {
  USER_LOGIN_SUCCESS: {
    level: 'crit',
    message: 'User ${userId} logged in successfully',
  },
  PAYMENT_FAILED: {
    level: 'notice',
    message: 'Payment failed for user ${uid.name}@${tenant}',
  },
} as const satisfies CustomLogEntry;

const customLogger = Logger.extend(CUSTOM_ENTRIES);
customLogger.log('PAYMENT_FAILED', { 'uid.name': '123', tenant: 'tenant' });
