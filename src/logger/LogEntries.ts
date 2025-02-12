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

  RADIUS_ON_HANDLE_ERROR: {
    level: 'err',
    message: 'Failed to handle packet from ${address}:${port} (${family}). ${error}',
  },
  RADIUS_ON_HANDLE_SUCCESS: {
    level: 'debug',
    message: 'Success to handle packet from ${address}:${port} (${family}).',
  },
} as const satisfies BaseLogEntry;
