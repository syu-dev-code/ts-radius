import type { Printable } from '@app/types/Utils';

const PLACE_HOLDER_RX = /(?<!\\)\$\{([^{}]+)\}/g;
const ESCAPED_PLACE_HOLDER_RX = /\\(\$\{[^{}]+\})/g;

export const replacePlaceHolder = (message: string, params: { [key: string]: Printable }): string =>
  message
    .replace(PLACE_HOLDER_RX, (matched, key) => (key in params ? `${params[key]}` : matched))
    .replace(ESCAPED_PLACE_HOLDER_RX, '$1');
