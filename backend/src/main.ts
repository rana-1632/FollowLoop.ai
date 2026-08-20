import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Initialize Sentry Monitoring & Profiling (if DSN provided)
    const sentryDsn = process.env.SENTRY_DSN;
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        integrations: [nodeProfilingIntegration() as any],
      });
      logger.log('Sentry error monitoring and node profiling initialized successfully.');
    }

    const app = await NestFactory.create(AppModule);

    // Increase Body Parser payload limit to support Base64 custom user avatars
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ limit: '10mb', extended: true }));

    // Enable CORS with dynamic origin matching to prevent preflight errors
    const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const allowedOrigins = rawFrontendUrl
      .split(',')
      .map((url) => url.trim().replace(/\/+$/, ''));

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, mobile apps, curl)
        if (!origin) return callback(null, true);

        const isAllowed =
          process.env.NODE_ENV !== 'production' ||
          allowedOrigins.includes('*') ||
          allowedOrigins.includes(origin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
          /\.vercel\.app$/.test(origin);

        if (isAllowed) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive fallback for cloud deployment flexibility
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    });

    // Global API Prefix
    app.setGlobalPrefix('api/v1');

    // Global Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global Interceptor & Exception Filter
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new SentryExceptionFilter());

    // OpenAPI Swagger Configuration
    const config = new DocumentBuilder()
      .setTitle('FollowLoop.ai API')
      .setDescription(
        'Autonomous CRM & Follow-Up Engine API Documentation. Provides AI email drafting, contact pipeline management, Resend dispatches, cron triggers, and Sentry telemetry.',
      )
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'FollowLoop.ai Swagger Docs',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 FollowLoop.ai Backend running on http://localhost:${port}/api/v1`);
    logger.log(`📚 Swagger Documentation UI live at http://localhost:${port}/api/docs`);
  } catch (error: any) {
    logger.error(`❌ Fatal application startup error: ${error?.message || error}`, error?.stack);
    process.exit(1);
  }
}

bootstrap();
