import { ConcurrentPacketHandler } from '@app/server/handlers/ConcurrentPacketHandler';
import { EchoPacketHandler2 } from '@tests/src/server/__mocks/EchoPacketHandler2';
import { DisposeTestPacketHandler } from '@tests/src/server/__mocks/DisposeTestPacketHandler';
import { DisposeTestPacketHandler2 } from '@tests/src/server/__mocks/DisposeTestPacketHandler2';
import type { RemoteInfo } from 'dgram';

describe('@app/server/handlers/ConcurrentPacketHandler', () => {
  it('processes packets concurrently when the queue is not locked', async () => {
    const delegate = new EchoPacketHandler2();
    const concurrency = 5;
    const handler = new ConcurrentPacketHandler(concurrency, delegate, 1000);

    const promises = [...Array(concurrency).keys()].map((index) => {
      const buffer = Buffer.from(`test ${index}`);
      const rinfo: RemoteInfo = {
        address: '127.0.0.1',
        port: 10000 + index,
        family: 'IPv4',
        size: buffer.length,
      };
      return handler.handle(buffer, rinfo);
    });

    // Check if the handler returned the correct responses (echoed packets)
    const responses = (await Promise.all(promises)).map((response) => {
      if (response === null) {
        return null;
      }
      return response.toString();
    });
    const expectedResponses = [...Array(concurrency).keys()].map((index) => `test ${index}`);
    expect(responses).toEqual(expectedResponses);

    // Check if the delegate handled all the packets
    expect(delegate.handledPackets).toHaveLength(concurrency);
  });

  it('does not process any packets when the queue is locked', async () => {
    const delegate = new EchoPacketHandler2();
    const concurrency = 11;
    const handler = new ConcurrentPacketHandler(concurrency, delegate);
    await handler.dispose();

    const promises = [...Array(concurrency).keys()].map((index) => {
      const buffer = Buffer.from(`test ${index}`);
      const rinfo: RemoteInfo = {
        address: '127.0.0.1',
        port: 10000 + index,
        family: 'IPv4',
        size: buffer.length,
      };
      return handler.handle(buffer, rinfo);
    });

    // Check if the handler returned null for all the packets
    const responses = await Promise.all(promises);
    expect(responses).toEqual(Array(concurrency).fill(null));

    // Check if the delegate did not handle any packets
    expect(delegate.handledPackets).toHaveLength(0);
  });

  it('returns from dispose method after the timeout without waiting for ongoing packet processing to complete', async () => {
    const disposeTimeoutMs = 200;

    const delegate = new DisposeTestPacketHandler();
    const handler = new ConcurrentPacketHandler(1, delegate, disposeTimeoutMs);
    const buffer = Buffer.from('test');
    const rinfo: RemoteInfo = {
      address: '127.0.0.1',
      port: 10000,
      family: 'IPv4',
      size: buffer.length,
    };

    // Start processing a packet, which will not finish before the disposeTimeoutMs is reached
    const promise = handler.handle(buffer, rinfo);

    try {
      await handler.dispose();
      const logs = global.mockLogger.logs;
      expect(logs).toHaveLength(1);
      const [code, level] = logs[0];
      expect(code).toBe('CONCURRENT_PACKET_HANDLER_DISPOSE_TIMEOUT');
      expect(level).toBe('warning');
    } finally {
      // Abort the packet processing
      delegate.abort = true;
      // Wait for the packet processing to finish
      await promise;
    }
  });

  it('returns from dispose method before the timeout is reached', async () => {
    const handlerWillResponseAfter = 200;
    const disposeTimeoutMs = 500;

    const delegate = new DisposeTestPacketHandler2(handlerWillResponseAfter);
    const handler = new ConcurrentPacketHandler(1, delegate, disposeTimeoutMs);
    const buffer = Buffer.from('test');
    const rinfo: RemoteInfo = {
      address: '127.0.0.1',
      port: 10000,
      family: 'IPv4',
      size: buffer.length,
    };

    // Start processing a packet, which will finish before the disposeTimeoutMs is reached
    const promise = handler.handle(buffer, rinfo);

    try {
      await handler.dispose();
      const logs = global.mockLogger.logs;
      expect(logs).toHaveLength(0);
    } finally {
      await promise;
    }
  });
});
