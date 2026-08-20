"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
const Sentry = require("@sentry/nestjs");
const profiling_node_1 = require("@sentry/profiling-node");
const app_module_1 = require("./app.module");
const sentry_exception_filter_1 = require("./common/filters/sentry-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        const sentryDsn = process.env.SENTRY_DSN;
        if (sentryDsn) {
            Sentry.init({
                dsn: sentryDsn,
                environment: process.env.NODE_ENV || 'development',
                tracesSampleRate: 1.0,
                profilesSampleRate: 1.0,
                integrations: [(0, profiling_node_1.nodeProfilingIntegration)()],
            });
            logger.log('Sentry error monitoring and node profiling initialized successfully.');
        }
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.use((0, express_1.json)({ limit: '10mb' }));
        app.use((0, express_1.urlencoded)({ limit: '10mb', extended: true }));
        const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const allowedOrigins = rawFrontendUrl
            .split(',')
            .map((url) => url.trim().replace(/\/+$/, ''));
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                const isAllowed = process.env.NODE_ENV !== 'production' ||
                    allowedOrigins.includes('*') ||
                    allowedOrigins.includes(origin) ||
                    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
                    /\.vercel\.app$/.test(origin);
                if (isAllowed) {
                    return callback(null, true);
                }
                return callback(null, true);
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        });
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }));
        app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
        app.useGlobalFilters(new sentry_exception_filter_1.SentryExceptionFilter());
        const config = new swagger_1.DocumentBuilder()
            .setTitle('FollowLoop.ai API')
            .setDescription('Autonomous CRM & Follow-Up Engine API Documentation. Provides AI email drafting, contact pipeline management, Resend dispatches, cron triggers, and Sentry telemetry.')
            .setVersion('1.0.0')
            .addBearerAuth()
            .addTag('Health & Monitoring', 'System health checks and Sentry debug telemetry')
            .addTag('Authentication', 'User registration and JWT auth')
            .addTag('Contacts & Deals', 'Lead and relationship pipeline management')
            .addTag('Follow-Up Tasks', 'Task scheduling and status tracking')
            .addTag('AI Email Generation', 'OpenAI gpt-4o-mini email drafting engine')
            .addTag('Email Dispatch & Audit Logs', 'Resend email sending and logging')
            .addTag('Autonomous Cron & Triggers', 'Background task processing')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            customSiteTitle: 'FollowLoop.ai Swagger Docs',
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
        const port = process.env.PORT || 3001;
        await app.listen(port);
        logger.log(`🚀 FollowLoop.ai Backend running on http://localhost:${port}/api/v1`);
        logger.log(`📚 Swagger Documentation UI live at http://localhost:${port}/api/docs`);
    }
    catch (error) {
        logger.error(`❌ Fatal application startup error: ${error?.message || error}`, error?.stack);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map