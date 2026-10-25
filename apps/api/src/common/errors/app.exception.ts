import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * The one exception type domain services should throw for expected,
 * user-facing failures ("offer already expired", "not your listing", ...).
 * Anything else (programmer errors, DB errors) is treated as 500 and its
 * details are never leaked to the client — see HttpExceptionFilter.
 */
export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly fields?: Record<string, string>,
  ) {
    super({ code, message, fields }, status);
  }

  static badRequest(message: string, code = 'BAD_REQUEST') {
    return new AppException(code, message, HttpStatus.BAD_REQUEST);
  }

  static notFound(entity: string, code = 'NOT_FOUND') {
    return new AppException(code, `${entity} not found`, HttpStatus.NOT_FOUND);
  }

  static forbidden(message = 'You do not have permission to do this', code = 'FORBIDDEN') {
    return new AppException(code, message, HttpStatus.FORBIDDEN);
  }

  static conflict(message: string, code = 'CONFLICT') {
    return new AppException(code, message, HttpStatus.CONFLICT);
  }

  static invalidState(message: string, code = 'INVALID_STATE_TRANSITION') {
    return new AppException(code, message, HttpStatus.UNPROCESSABLE_ENTITY);
  }

  static validation(fields: Record<string, string>, message = 'Invalid request') {
    return new AppException('VALIDATION_ERROR', message, HttpStatus.BAD_REQUEST, fields);
  }
}
