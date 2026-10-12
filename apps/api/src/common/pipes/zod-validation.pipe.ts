import { PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { AppException } from '../errors/app.exception';

/**
 * The one and only request-validation mechanism in this API — per the
 * project spec, Zod is used everywhere, never class-validator. Attach with
 * `@UsePipes(new ZodValidationPipe(mySchema))` on a controller method, or
 * wrap a single param: `@Body(new ZodValidationPipe(mySchema)) dto`.
 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') || '_root';
        if (!fields[path]) fields[path] = issue.message;
      }
      throw AppException.validation(fields);
    }
    return result.data;
  }
}
