"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        let dbUrl = process.env.DATABASE_URL || '';
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
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        try {
            this.logger.log('Initializing database connection with Prisma...');
            await this.$connect();
            this.logger.log('✅ PostgreSQL Database connected successfully.');
        }
        catch (error) {
            this.logger.error(`❌ Database initialization failed on startup: ${error?.message || error}`);
            this.logger.warn('⚠️ Application running with degraded database connection. Retries will execute on request.');
        }
    }
    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('PostgreSQL Database connection closed.');
        }
        catch (error) {
            this.logger.error('Error disconnecting from database:', error?.message || error);
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map