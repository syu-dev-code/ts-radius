import type { Code } from '@app/protocol/packet/Code';
export type CodeMap = typeof Code.table;
export type CodeName = keyof CodeMap;
export type CodeValue = CodeMap[CodeName];
export type ReverseCodeMap = {
  [P in CodeValue]: {
    [K in CodeName]: CodeMap[K] extends P ? K : never;
  }[CodeName];
};
