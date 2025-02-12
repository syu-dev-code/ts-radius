export class PacketDecodeError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'INVALID_CODE'
      | 'INVALID_LENGTH'
      | 'INVALID_AUTHENTICATOR'
      | 'INVALID_ATTRIBUTE'
  ) {
    super(message);
    this.name = PacketDecodeError.name;
  }
}
