import { PacketDecodeError } from '@app/error/PacketDecodeError';

describe('@app/error/PacketDecodeError', () => {
  it('should correctly initialize with message and code: INVALID_CODE', async () => {
    const message = 'This is error_message.';
    const code = 'INVALID_CODE';

    const error = new PacketDecodeError(message, code);
    expect(error).toBeInstanceOf(PacketDecodeError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
  });

  it('should correctly initialize with message and code: INVALID_LENGTH', async () => {
    const message = 'This is error_message.';
    const code = 'INVALID_LENGTH';

    const error = new PacketDecodeError(message, code);
    expect(error).toBeInstanceOf(PacketDecodeError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
  });

  it('should correctly initialize with message and code: INVALID_AUTHENTICATOR', async () => {
    const message = 'This is error_message.';
    const code = 'INVALID_AUTHENTICATOR';

    const error = new PacketDecodeError(message, code);
    expect(error).toBeInstanceOf(PacketDecodeError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
  });

  it('should correctly initialize with message and code: INVALID_ATTRIBUTE', async () => {
    const message = 'This is error_message.';
    const code = 'INVALID_ATTRIBUTE';

    const error = new PacketDecodeError(message, code);
    expect(error).toBeInstanceOf(PacketDecodeError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
  });
});
