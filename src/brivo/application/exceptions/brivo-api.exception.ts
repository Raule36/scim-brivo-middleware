export class BrivoApiException extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'BrivoApiError';
  }
}
