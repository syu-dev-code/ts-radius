import { md5 } from '@app/lib/crypto/md5';

describe('@app/lib/crypto/md5', () => {
  it('should generate the correct MD5 hash', () => {
    const input = Buffer.from('123456789');
    const actual = md5(input);
    const expected = Buffer.from('25f9e794323b453885f5181f1b624d0b', 'hex');
    expect(actual).toEqual(expected);
  });
});
