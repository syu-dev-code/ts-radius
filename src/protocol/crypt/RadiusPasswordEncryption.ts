import { md5 } from '@app/lib/crypto/md5';

export class RadiusPasswordEncryption {
  /**
   * decrypt User-Password attribute
   * @see RFC2865 - 5.2. User-Password
   * @param encrypted - encrypted password
   * @param secret - shared secret
   * @param authenticator - request authenticator
   * @returns - decrypted password
   */
  static decrypt(encrypted: Buffer, secret: string, authenticator: Buffer): string {
    const encryptedChunks: Buffer[] = [];
    for (let i = 0; i < encrypted.length; i += 16) {
      encryptedChunks.push(encrypted.subarray(i, i + 16));
    }

    let b = md5(Buffer.concat([Buffer.from(secret, 'utf-8'), authenticator]));
    const decryptedChunks: Buffer[] = [];
    for (const chunk of encryptedChunks) {
      const decryptedChunk = Buffer.alloc(chunk.length);
      for (let i = 0; i < chunk.length; i++) {
        decryptedChunk[i] = chunk[i] ^ b[i];
      }
      decryptedChunks.push(decryptedChunk);
      b = md5(Buffer.concat([Buffer.from(secret, 'utf-8'), chunk]));
    }

    // Remove null bytes
    const resultBuffer = Buffer.concat(decryptedChunks);
    const nullIndex = resultBuffer.indexOf(0);
    const finalBuffer = nullIndex !== -1 ? resultBuffer.subarray(0, nullIndex) : resultBuffer;
    return finalBuffer.toString('utf-8');
  }

  /**
   * encrypt User-Password attribute
   * @see RFC2865 - 5.2. User-Password
   * @param value - decrypted password
   * @param secret - shared secret
   * @param authenticator - request authenticator
   * @returns - encrypted password
   */
  static encrypt(value: string, secret: string, authenticator: Buffer): Buffer {
    const encryptedChunks: Buffer[] = [];
    for (let i = 0; i < value.length; i += 16) {
      encryptedChunks.push(Buffer.from(value.substring(i, i + 16), 'utf-8'));
    }
    let b = md5(Buffer.concat([Buffer.from(secret, 'utf-8'), authenticator]));
    for (const chunk of encryptedChunks) {
      const encryptedChunk = Buffer.alloc(chunk.length);
      for (let i = 0; i < chunk.length; i++) {
        encryptedChunk[i] = chunk[i] ^ b[i];
      }
      encryptedChunks.push(encryptedChunk);
      b = md5(Buffer.concat([Buffer.from(secret, 'utf-8'), chunk]));
    }
    return Buffer.concat(encryptedChunks);
  }
}
