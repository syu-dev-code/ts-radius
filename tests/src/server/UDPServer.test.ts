import { LOG_ENTRIES } from '@app/logger/LogEntries';
import { UDPServer } from '@app/server/UDPServer';
import { EchoPacketHandler } from '@tests/src/server/__mocks/EchoPacketHandler';
import { OnStopTestPacketHandler } from '@tests/src/server/__mocks/OnStopTestPacketHandler';
import { SilentPacketHandler } from '@tests/src/server/__mocks/SilentPacketHandler';
import { ThrowErrorPacketHandler } from '@tests/src/server/__mocks/ThrowErrorPacketHandler';
import { UDPClient } from '@tests/src/server/__mocks/UDPClient';
import { Socket } from 'dgram';

describe('@app/server/UDPServer', () => {
  it('should be able to start', async () => {
    const handler = new EchoPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    try {
      await server.start();
      const serverSocket = Reflect.get(server, 'server') as Socket;
      expect(serverSocket.address()).toMatchObject({
        address: global.UDP.address,
        port: global.UDP.port,
      });
      expect(serverSocket.listeners('listening')).toHaveLength(0);
      expect(serverSocket.listeners('error')).toHaveLength(1);
      expect(serverSocket.listeners('message')).toHaveLength(1);
      expect(server.isRunning).toBe(true);
    } finally {
      await server.stop();
    }
  });

  it('should be able to stop', async () => {
    const handler = new EchoPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    try {
      await server.start();
      await server.stop();
      const serverSocket = Reflect.get(server, 'server') as Socket;
      expect(serverSocket).toBeNull();
      expect(server.isRunning).toBe(false);
    } finally {
      if (server.isRunning) {
        await server.stop();
      }
    }
  });

  it('should throw an error if the server is already running', async () => {
    const handler = new EchoPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    try {
      await server.start();
      const serverSocket = Reflect.get(server, 'server') as Socket;
      const currentListeners = {
        listening: serverSocket.listeners('listening'),
        error: serverSocket.listeners('error'),
        message: serverSocket.listeners('message'),
      };

      expect(() => server.start()).rejects.toThrow();

      // check listener is not changed
      expect(currentListeners).toMatchObject({
        listening: serverSocket.listeners('listening'),
        error: serverSocket.listeners('error'),
        message: serverSocket.listeners('message'),
      });
    } finally {
      await server.stop();
    }
  });

  it('If an error occurs when starting the server, it should log an error and throw an error', async () => {
    const handler = new EchoPacketHandler();
    const server = new UDPServer(global.UDP.port, 'invalid host', handler);
    const logEntryKey = 'SERVER_ON_START_FAILED';

    try {
      await expect(() => server.start()).rejects.toThrow();
      const [code, level] = global.mockLogger.getLastLog();
      expect(code).toBe(logEntryKey);
      expect(level).toBe(LOG_ENTRIES[logEntryKey].level);
      expect(server.isRunning).toBe(false);
      const serverSocket = Reflect.get(server, 'server') as Socket;
      expect(serverSocket).toBeNull();
    } finally {
      if (server.isRunning) {
        await server.stop();
      }
    }
  });

  it('should throw an error if the server is not running', async () => {
    const handler = new EchoPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    expect(() => server.stop()).rejects.toThrow();
  });

  it('should be able to handle a packet', async () => {
    const client = new UDPClient(global.UDP.port, global.UDP.address);
    const handler = new EchoPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    const payload = Buffer.from(`This is a test packet: ${Date.now()}`);
    try {
      await server.start();
      const response = await client.request(payload);
      expect(response).toEqual(payload);
      expect(handler.handleCalled).toBe(true);
    } finally {
      await server.stop();
      await client.close();
    }
  });

  it('should be able to log an unhandled error', async () => {
    const handler = new EchoPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    const logEntryKey = 'SERVER_ON_UNHANDLE_ERROR';
    try {
      await server.start();
      const serverSocket = Reflect.get(server, 'server') as Socket;
      const message = `Test Error ${Date.now()}`;
      serverSocket.emit('error', new Error(message));
      const [code, level] = global.mockLogger.getLastLog();
      expect(code).toBe(logEntryKey);
      expect(level).toBe(LOG_ENTRIES[logEntryKey].level);
    } finally {
      await server.stop();
    }
  });

  it('should be able to log on send error', async () => {
    const handler = new OnStopTestPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    const client = new UDPClient(global.UDP.port, global.UDP.address);
    try {
      await server.start();
    } finally {
      await server.stop();
      await client.close();
    }
  });

  it('when handle returns null, server should not send a response', async () => {
    const client = new UDPClient(global.UDP.port, global.UDP.address);
    const handler = new SilentPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    const payload = Buffer.from(`This is a test packet: ${Date.now()}`);

    try {
      await server.start();
      const serverSocket = Reflect.get(server, 'server') as Socket;
      jest.spyOn(serverSocket, 'send').mockImplementation(jest.fn());
      await client.requestWithWaitForDone(payload, () => handler.handleCalled);
      expect(serverSocket.send).not.toHaveBeenCalled();
    } finally {
      await server.stop();
      await client.close();
    }
  });

  it('when handle throws an error, server should catch it and log it', async () => {
    const errorMessage = `Test Error: ${Date.now()}`;
    const handler = new ThrowErrorPacketHandler(errorMessage);
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    const client = new UDPClient(global.UDP.port, global.UDP.address);
    const payload = Buffer.from(`This is a test packet: ${Date.now()}`);
    const logEntryKey = 'SERVER_ON_HANDLE_PACKET_ERROR';

    try {
      await server.start();
      const serverSocket = Reflect.get(server, 'server') as Socket;
      jest.spyOn(serverSocket, 'send').mockImplementation(jest.fn());
      await client.requestWithWaitForDone(payload, () => handler.handleCalled);
      const [code, level] = global.mockLogger.getLastLog();
      expect(code).toBe(logEntryKey);
      expect(level).toBe(LOG_ENTRIES[logEntryKey].level);
      expect(serverSocket.send).not.toHaveBeenCalled();
      expect(handler.handleCalled).toBe(true);
    } finally {
      await server.stop();
      await client.close();
    }
  });

  it('When an error occurs during sending, the server should log an error and throw an error', async () => {
    const client = new UDPClient(global.UDP.port, global.UDP.address);
    const handler = new EchoPacketHandler();
    const server = new UDPServer(global.UDP.port, global.UDP.address, handler);
    const payload = Buffer.from(`This is a test packet: ${Date.now()}`);
    const logEntryKey = 'SERVER_ON_SEND_PACKET_ERROR';

    try {
      await server.start();
      const serverSocket = Reflect.get(server, 'server') as Socket;

      const sendMock = jest.fn((...args: Parameters<Socket['send']>) => {
        const [message, __, ___, callback] = args;
        callback?.(new Error('send error'), message.length);
        return serverSocket;
      });
      jest.spyOn(serverSocket, 'send').mockImplementation(sendMock);
      const isCalledSendMock = () => sendMock.mock.calls.length > 0;
      await client.requestWithWaitForDone(payload, isCalledSendMock);
      const [code, level] = global.mockLogger.getLastLog();
      expect(code).toBe(logEntryKey);
      expect(level).toBe(LOG_ENTRIES[logEntryKey].level);
    } finally {
      await server.stop();
      await client.close();
    }
  });
});
