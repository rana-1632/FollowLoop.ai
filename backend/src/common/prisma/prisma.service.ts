import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let dbUrl = process.env.DATABASE_URL || '';

    // Ensure sslmode parameter is properly formatted for remote cloud Postgres databases if missing
    if (dbUrl && !dbUrl.includes('sslmode=') && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')) {
      const separator = dbUrl.includes('?') ? '&' : '?';
      dbUrl = `${dbUrl}${separator}sslmode=require`;
    }

    super({
      datasources: dbUrl
        ? {
            db: {
              url: dbUrl,
            },
          }
        : undefined,
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing database connection with Prisma...');
      await this.$connect();
      this.logger.log('✅ PostgreSQL Database connected successfully.');
    } catch (error: any) {
      this.logger.error(
        `❌ Database initialization failed on startup: ${error?.message || error}`,
      );
      this.logger.warn(
        '⚠️ Application running with degraded database connection. Retries will execute on request.',
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('PostgreSQL Database connection closed.');
    } catch (error: any) {
      this.logger.error('Error disconnecting from database:', error?.message || error);
    }
  }
}
