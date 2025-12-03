import { BrivoApiException } from '@brivo/application';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ScimException, ScimExceptionBase } from '@scim/application';
import { s_ScimException } from '@scim/contracts';
import { Response } from 'express';

@Catch(BrivoApiException, ScimExceptionBase)
export class ScimExceptionFilter implements ExceptionFilter {
  public catch(exception: BrivoApiException | ScimExceptionBase, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let scimException: ScimExceptionBase;

    if (exception instanceof BrivoApiException) {
      scimException = new ScimExceptionBase(
        exception.status,
        exception.message,
        undefined,
        exception.metadata,
      );
    } else {
      scimException = exception;
    }

    const payload: ScimException = s_ScimException.parse({
      detail: scimException.detail,
      status: scimException.status,
      scimType: scimException.scimType,
      metadata: scimException.metadata,
    });

    response.status(payload.status).type('application/scim+json').json(payload);
  }
}
