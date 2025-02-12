export interface IAttribute {
  readonly value: unknown;
  readonly length: number;
  get name(): string;
  get type(): number;

  encode(): Buffer;
  encodeValue(): Buffer;
}

export interface IAttributeStatic {
  readonly TYPE: number;
  readonly NAME: string;
  strict: boolean;
  strictLength: boolean;
  strictValue: boolean;
}
