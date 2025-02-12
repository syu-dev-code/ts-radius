import { DefaultSecretProvider } from '@app/protocol/secret/DefaultSecretProvider';
import { ConcurrentPacketHandler } from '@app/server/handlers/ConcurrentPacketHandler';
import { RadiusPacketHandler } from '@app/server/handlers/RadiusPacketHandler';
import { UDPServer } from '@app/server/UDPServer';
import { Logger } from '@app/logger/Logger';
import { StdOutLogger } from '@app/logger/StdOutLogger';

Logger.setDelegate(new StdOutLogger());

const secretProvider = new DefaultSecretProvider({
  '127.0.0.1': 'secret',
});
const radiusPacketHandler = new RadiusPacketHandler(secretProvider);
const concurrentPacketHandler = new ConcurrentPacketHandler(100, radiusPacketHandler);
const server = new UDPServer(1812, '127.0.0.1', concurrentPacketHandler);
await server.start();
