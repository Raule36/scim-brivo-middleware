import { s_ScimException } from '@scim/contracts';
import { z } from 'zod';

export type ScimException = z.infer<typeof s_ScimException>;

export class ScimExceptionBase extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly scimType?: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(detail);
  }
}

export class ScimNotFoundException extends ScimExceptionBase {
  constructor(detail = 'Resource not found', metadata?: Record<string, unknown>) {
    super(404, detail, 'noTarget', metadata);
  }
}

export class ScimBadRequestException extends ScimExceptionBase {
  constructor(detail = 'Request body failed validation', metadata?: Record<string, unknown>) {
    super(400, detail, 'invalidValue', metadata);
  }
}
