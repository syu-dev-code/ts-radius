import type { CodeName, CodeValue, ReverseCodeMap } from '@app/types/Code';
import type {} from '@app/types/Code';

export class Code {
  public static readonly table = {
    'Access-Request': 1,
    'Access-Accept': 2,
    'Access-Reject': 3,
    'Accounting-Request': 4,
    'Accounting-Response': 5,
    'Access-Challenge': 11,
    'Status-Server': 12,
    'Status-Client': 13,
  } as const;

  public static readonly reverseTable = Object.entries(Code.table).reduce<ReverseCodeMap>(
    (acc, [key, value]) => ({
      ...acc,
      [value]: key,
    }),
    {} as ReverseCodeMap
  );

  readonly name: CodeName;
  readonly value: CodeValue;

  private constructor(value: CodeValue) {
    this.value = value;
    this.name = Code.reverseTable[value];
  }

  static isValid(code: number): code is CodeValue {
    return code in this.reverseTable;
  }

  static from(code: CodeValue) {
    if (!this.isValid(code)) {
      throw new Error(`Invalid code: ${code}`);
    }
    return new this(code);
  }
}
