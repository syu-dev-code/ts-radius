/**
 * @description Load the FreeRadius configuration file and parse client configurations.
 * @param conf The FreeRadius configuration file contents as a string
 * @returns Array of parsed client configurations
 */
interface ClientConfig {
  shortName: string;
  ipaddr?: string;
  ipv4addr?: string;
  ipv6addr?: string;
  proto?: string;
  secret?: string;
  requireMessageAuthenticator?: string;
  limitProxyState?: string;
  limit?: {
    maxConnections?: number;
    lifetime?: number;
    idleTimeout?: number;
  };
}

export const loadFreeRadiusClientConf = (conf: string): ClientConfig[] => {
  const lines = conf
    .split(/\r|\n|\r\n/)
    .map((line, index) => ({ text: line.trim(), lineNum: index + 1 }))
    .filter(({ text }) => text.length > 0 && !text.startsWith('#'));

  const clients: ClientConfig[] = [];
  let currentClient: Partial<ClientConfig> = {};
  let inLimitBlock = false;
  let blockDepth = 0;
  const blockStack: ('client' | 'limit')[] = [];
  const definedProperties = new Set<string>();

  for (const { text: line, lineNum } of lines) {
    if (line.endsWith('{')) {
      const blockType = line.replace(/\s*{$/, '').trim();

      if (blockDepth === 0) {
        const match = blockType.match(/^client\s+(.+)$/);
        if (match) {
          currentClient.shortName = match[1];
        } else {
          throw new Error(`Invalid client block declaration at line ${lineNum}: ${blockType}`);
        }
        blockStack.push('client');
        definedProperties.clear();
      } else if (blockDepth === 1) {
        if (blockType === 'limit') {
          inLimitBlock = true;
          blockStack.push('limit');
          definedProperties.clear();
        } else {
          throw new Error(`Invalid block type inside client at line ${lineNum}: ${blockType}`);
        }
      }

      blockDepth++;
    } else if (line === '}') {
      const currentBlock = blockStack.pop();
      if (!currentBlock) {
        throw new Error(`Unexpected closing brace at line ${lineNum}`);
      }

      if (currentBlock === 'limit') {
        inLimitBlock = false;
      } else if (currentBlock === 'client') {
        if (!currentClient.shortName) {
          throw new Error(`Client block must have a name at line ${lineNum}`);
        }
        clients.push(currentClient as ClientConfig);
        currentClient = {};
      }
      definedProperties.clear();
      blockDepth--;
    } else if (line.includes('=')) {
      const [key, ...rest] = line.split('=').map((s) => s.trim());
      const value = rest.join('=').trim();

      if (definedProperties.has(key)) {
        throw new Error(`Duplicate property '${key}' at line ${lineNum}`);
      }
      definedProperties.add(key);

      if (inLimitBlock) {
        if (!currentClient.limit) {
          currentClient.limit = {};
        }
        switch (key) {
          case 'max_connections':
            currentClient.limit.maxConnections = parseInt(value, 10);
            break;
          case 'lifetime':
            currentClient.limit.lifetime = parseInt(value, 10);
            break;
          case 'idle_timeout':
            currentClient.limit.idleTimeout = parseInt(value, 10);
            break;
          default:
            throw new Error(`Unknown limit property at line ${lineNum}: ${key}`);
        }
      } else if (blockDepth === 1) {
        switch (key) {
          case 'ipaddr':
            currentClient.ipaddr = value;
            break;
          case 'ipv4addr':
            currentClient.ipv4addr = value;
            break;
          case 'ipv6addr':
            currentClient.ipv6addr = value;
            break;
          case 'proto':
            currentClient.proto = value;
            break;
          case 'secret':
            currentClient.secret = value;
            break;
          case 'require_message_authenticator':
            currentClient.requireMessageAuthenticator = value;
            break;
          case 'limit_proxy_state':
            currentClient.limitProxyState = value;
            break;
          default:
            throw new Error(`Unknown client property at line ${lineNum}: ${key}`);
        }
      } else {
        throw new Error(`Unexpected property outside of block at line ${lineNum}: ${line}`);
      }
    }
  }

  if (blockStack.length > 0) {
    throw new Error(`Unclosed blocks: ${blockStack.join(', ')}`);
  }

  return clients;
};
