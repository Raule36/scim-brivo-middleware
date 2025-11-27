import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

import { s_ScimException } from '../interfaces/schemas';
import { ScimException, ScimExceptionBase } from './scim-exception';

@Catch(ScimExceptionBase)
export class ScimExceptionFilter implements ExceptionFilter {
  public catch(exception: ScimExceptionBase, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    const payload: ScimException = s_ScimException.parse({
      detail: exception.detail,
      status: exception.status,
      scimType: exception.scimType,
      metadata: exception.metadata,
    });

    response.status(payload.status).type('application/scim+json').json(payload);
  }
}
