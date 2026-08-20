"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SentryExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const Sentry = require("@sentry/nestjs");
let SentryExceptionFilter = SentryExceptionFilter_1 = class SentryExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(SentryExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            message = exception.getResponse();
        }
        else if (exception?.code === 'P2002') {
            status = common_1.HttpStatus.CONFLICT;
            const target = exception.meta?.target ? ` on fields: (${exception.meta.target.join(', ')})` : '';
            message = {
                statusCode: common_1.HttpStatus.CONFLICT,
                message: `A record with this unique value already exists${target}.`,
                error: 'Conflict',
            };
        }
        else if (exception?.code === 'P2025') {
            status = common_1.HttpStatus.NOT_FOUND;
            message = {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: exception.meta?.cause || 'Requested record was not found in database.',
                error: 'Not Found',
            };
        }
        else if (exception?.code === 'P2003') {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Invalid reference ID provided.',
                error: 'Bad Request',
            };
        }
        else if (exception?.name === 'PrismaClientValidationError' || exception?.code === 'P2023') {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Invalid argument or ID type passed to database query.',
                error: 'Bad Request',
            };
        }
        else if (exception instanceof Error) {
            message = {
                statusCode: status,
                message: exception.message || 'Internal server error',
            };
        }
        if (status >= 500) {
            this.logger.error(`[500 Internal Error] ${request.method} ${request.url}`, exception?.stack);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException(exception);
            }
        }
        else {
            this.logger.warn(`[${status}] ${request.method} ${request.url} - ${JSON.stringify(message)}`);
        }
        response.status(status).json({
            success: false,
            timestamp: new Date().toISOString(),
            path: request.url,
            error: typeof message === 'string' ? { message } : message,
        });
    }
};
exports.SentryExceptionFilter = SentryExceptionFilter;
exports.SentryExceptionFilter = SentryExceptionFilter = SentryExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], SentryExceptionFilter);
//# sourceMappingURL=sentry-exception.filter.js.map