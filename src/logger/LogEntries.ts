import { BaseLogEntry } from '@app/types/Log';

export const LOG_ENTRIES = {
  SERVER_ON_START_SUCCESS: {
    level: 'info',
    message: 'Server started on ${host}:${port}',
  },
  SERVER_ON_START_FAILED: {
    level: 'crit',
    message: 'Failed to start server on ${host}:${port}. ${error}',
  },
  SERVER_ON_STOP: {
    level: 'info',
    message: 'Server stopped',
  },
  SERVER_ON_UNHANDLE_ERROR: {
    level: 'crit',
    message: 'Unhandled error on server: ${error}',
  },
  SERVER_ON_RECEIVE_PACKET: {
    level: 'debug',
    message: 'Receive packet from ${ip}:${port} (${family})',
  },
  SERVER_ON_SEND_PACKET_ERROR: {
    level: 'err',
    message: 'Failed to response packet to ${address}:${port} (${family}). ${error}',
  },
  SERVER_ON_HANDLE_PACKET_ERROR: {
    level: 'err',
    message: 'Failed to handle packet from ${address}:${port} (${family}). ${error}',
  },

  CONCURRENT_PACKET_HANDLER_DISPOSE_TIMEOUT: {
    level: 'warning',
    message: 'Timeout on stop',
  },

  RADIUS_ON_HANDLE_NAS_NOT_FOUND: {
    level: 'warning',
    message: 'NAS not found for ${address}:${port}',
  },
  RADIUS_ON_HANDLE_PACKET_DECODE_ERROR: {
    level: 'warning',
    message: 'Failed to decode packet from ${address}:${port} (${family}). ${error}',
  },
  RADIUS_TRANSACTION_DUPLICATED_REQUEST: {
    level: 'warning',
    message: 'Duplicate packet from ${address}:${port} (${family}).',
  },
  RADIUS_TRANSACTION_ACQUIRE_ERROR: {
    level: 'err',
    message: 'Failed to acquire transaction for ${address}:${port} (${family}). ${error}',
  },
  RADIUS_TRANSACTION_RELEASE_ERROR: {
    level: 'err',
    message: 'Failed to release transaction for ${address}:${port} (${family}). ${error}',
  },
  RADIUS_TRANSACTION_CLEANUP_ERROR: {
    level: 'err',
    message: 'Failed to cleanup transactions. ${error}',
  },
  RADIUS_TRANSACTION_CLEANUP_SUCCESS: {
    level: 'debug',
    message:
      'Transaction cleanup completed. Count changed from ${beforeCleanup} to ${afterCleanup} (${cleaned} entries removed)',
  },
  RADIUS_ON_HANDLE_ERROR: {
    level: 'err',
    message: 'Failed to handle packet from ${address}:${port} (${family}). ${error}',
  },
  RADIUS_ON_HANDLE_SUCCESS: {
    level: 'debug',
    message: 'Success to handle packet from ${address}:${port} (${family}).',
  },
} as const satisfies BaseLogEntry;
