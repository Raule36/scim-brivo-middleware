import { PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

import { ScimBadRequestException } from '../exceptions/scim-exception';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  public transform(value: unknown): unknown {
    try {
      console.log('@ZodValidationPipe', value);
      return this.schema.parse(value);
    } catch (error) {
      throw new ScimBadRequestException(JSON.stringify((error as ZodError).issues));
    }
  }
}
