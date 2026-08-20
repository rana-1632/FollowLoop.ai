import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Response, Request } from 'express';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception?.code === 'P2002') {
      // Prisma Unique Constraint Error (e.g. Email already registered)
      status = HttpStatus.CONFLICT;
      const target = exception.meta?.target ? ` on fields: (${(exception.meta.target as string[]).join(', ')})` : '';
      message = {
        statusCode: HttpStatus.CONFLICT,
        message: `A record with this unique value already exists${target}.`,
        error: 'Conflict',
      };
    } else if (exception?.code === 'P2025') {
      // Prisma Record Not Found Error
      status = HttpStatus.NOT_FOUND;
      message = {
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.meta?.cause || 'Requested record was not found in database.',
        error: 'Not Found',
      };
    } else if (exception?.code === 'P2003') {
      // Prisma Foreign Key Constraint Failure
      status = HttpStatus.BAD_REQUEST;
      message = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid reference ID provided.',
        error: 'Bad Request',
      };
    } else if (exception?.name === 'PrismaClientValidationError' || exception?.code === 'P2023') {
      // Prisma Client Validation / Invalid Argument / Format Error
      status = HttpStatus.BAD_REQUEST;
      message = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid argument or ID type passed to database query.',
        error: 'Bad Request',
      };
    } else if (exception instanceof Error) {
      message = {
        statusCode: status,
        message: exception.message || 'Internal server error',
      };
    }

    // Log & capture unhandled server errors to Sentry
    if (status >= 500) {
      this.logger.error(`[500 Internal Error] ${request.method} ${request.url}`, exception?.stack);
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(exception);
      }
    } else {
      this.logger.warn(`[${status}] ${request.method} ${request.url} - ${JSON.stringify(message)}`);
    }

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: typeof message === 'string' ? { message } : message,
    });
  }
}
