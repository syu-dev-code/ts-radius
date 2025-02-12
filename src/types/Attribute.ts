import { IAttribute } from '@app/protocol/packet/attributes/IAttribute';
export type AttributeClass = new (...args: any[]) => IAttribute;
export type IPV4Address = [number, number, number, number];
export type AttributeInfo = [buffer: Buffer, start: number, end: number, secret: string];
