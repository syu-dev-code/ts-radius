import crypto from 'crypto';
export const md5 = (data: Buffer) => crypto.createHash('md5').update(data).digest();
