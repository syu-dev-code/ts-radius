import { ConcurrentPacketHandler } from '@app/server/handlers/ConcurrentPacketHandler';
import { EchoPacketHandler2 } from '@tests/src/server/__mocks/EchoPacketHandler2';
import { OnStopTestPacketHandler } from '@tests/src/server/__mocks/OnStopTestPacketHandler';
import { OnStopTestPacketHandler2 } from '@tests/src/server/__mocks/OnStopTestPacketHandler2';
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
    await handler.onStop();

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

  it('returns from onStop after the timeout without waiting for ongoing packet processing to complete', async () => {
    const onStopTimeout = 200;

    const delegate = new OnStopTestPacketHandler();
    const handler = new ConcurrentPacketHandler(1, delegate, onStopTimeout);
    const buffer = Buffer.from('test');
    const rinfo: RemoteInfo = {
      address: '127.0.0.1',
      port: 10000,
      family: 'IPv4',
      size: buffer.length,
    };

    // Start processing a packet, which will not finish before the onStopTimeout is reached
    const promise = handler.handle(buffer, rinfo);

    try {
      await handler.onStop();
      const logs = global.mockLogger.logs;
      expect(logs).toHaveLength(1);
      const [code, level] = logs[0];
      expect(code).toBe('CONCURRENT_PACKET_HANDLER_ON_STOP_TIMEOUT');
      expect(level).toBe('warning');
    } finally {
      // Abort the packet processing
      delegate.abort = true;
      // Wait for the packet processing to finish
      await promise;
    }
  });

  it('returns from onStop before the timeout is reached', async () => {
    const handlerWillResponseAfter = 200;
    const onStopTimeout = 500;

    const delegate = new OnStopTestPacketHandler2(handlerWillResponseAfter);
    const handler = new ConcurrentPacketHandler(1, delegate, onStopTimeout);
    const buffer = Buffer.from('test');
    const rinfo: RemoteInfo = {
      address: '127.0.0.1',
      port: 10000,
      family: 'IPv4',
      size: buffer.length,
    };

    // Start processing a packet, which will finish before the onStopTimeout is reached
    const promise = handler.handle(buffer, rinfo);

    try {
      await handler.onStop();
      const logs = global.mockLogger.logs;
      expect(logs).toHaveLength(0);
    } finally {
      await promise;
    }
  });
});
