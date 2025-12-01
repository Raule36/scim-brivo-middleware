import { PipeTransform } from '@nestjs/common';
import { ScimBadRequestException } from '@scim/application';
import { ZodError, ZodSchema } from 'zod';

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
