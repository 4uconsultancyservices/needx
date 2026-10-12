import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wraps every successful controller return value in the standard envelope:
 *   { success: true, data: <controller return value>, meta? }
 * Controllers can return { data, meta } to control the meta block (e.g.
 * pagination), or just return the raw payload for the common case.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result: unknown) => {
        if (result && typeof result === 'object' && '__raw' in (result as Record<string, unknown>)) {
          return (result as { __raw: unknown }).__raw;
        }
        if (
          result &&
          typeof result === 'object' &&
          'data' in (result as Record<string, unknown>) &&
          'meta' in (result as Record<string, unknown>)
        ) {
          const { data, meta } = result as { data: unknown; meta: unknown };
          return { success: true, data, meta };
        }
        return { success: true, data: result ?? null };
      }),
    );
  }
}
