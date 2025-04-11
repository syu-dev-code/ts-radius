import { ConcurrentPacketHandler } from '@app/server/handlers/ConcurrentPacketHandler';
import { RadiusPacketHandler } from '@app/server/handlers/RadiusPacketHandler';
import { UDPServer } from '@app/server/UDPServer';
import { MemoryRadiusTransaction } from '@app/protocol/packet/RadiusTransaction';
import { DefaultNasProvider } from '@app/protocol/nas/DefaultNasProvider';
import { StdOutLogger } from '@app/logger/StdOutLogger';
import { Logger } from '@app/logger/Logger';

Logger.setDelegate(new StdOutLogger());
const nasProvider = new DefaultNasProvider([
  {
    shortName: 'test',
    secret: 'secret',
    address: {
      value: '127.0.0.1',
      type: 'ipv4addr',
    },
  },
]);
const transaction = new MemoryRadiusTransaction();
const radiusPacketHandler = new RadiusPacketHandler(nasProvider, transaction);
const concurrentPacketHandler = new ConcurrentPacketHandler(100, radiusPacketHandler);
const server = new UDPServer(1812, '127.0.0.1', concurrentPacketHandler);
await server.start();
