import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from '../errors/app.exception';

interface ErrorShape {
  code: string;
  message: string;
  fields?: Record<string, string>;
  requestId?: string;
}

/**
 * Every error response — expected or not — comes out in the same envelope:
 *   { success: false, error: { code, message, fields?, requestId? } }
 * Stack traces, Mongo error internals, and secrets never reach the client.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();
    const requestId = request.requestId;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error: ErrorShape = {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again.',
      requestId,
    };

    if (exception instanceof AppException) {
      status = exception.getStatus();
      const body = exception.getResponse() as { code: string; message: string; fields?: Record<string, string> };
      error = { code: body.code, message: body.message, fields: body.fields, requestId };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ?? exception.message);
      error = {
        code: HttpStatus[status] ?? 'HTTP_ERROR',
        message: Array.isArray(message) ? message.join('; ') : message,
        fields: extractValidationFields(body),
        requestId,
      };
    } else if (exception instanceof Error) {
      // Unexpected/programmer error — log full detail server-side, never client-side.
      this.logger.error(`${request.method} ${request.url} :: ${exception.message}`, exception.stack);
    }

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} -> ${status} [${requestId}]`);
    }

    response.status(status).json({ success: false, error });
  }
}

function extractValidationFields(body: unknown): Record<string, string> | undefined {
  if (body && typeof body === 'object' && 'fields' in body) {
    return (body as { fields?: Record<string, string> }).fields;
  }
  return undefined;
}
