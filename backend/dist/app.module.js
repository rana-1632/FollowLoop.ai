"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const configuration_1 = require("./config/configuration");
const prisma_module_1 = require("./common/prisma/prisma.module");
const health_module_1 = require("./modules/health/health.module");
const auth_module_1 = require("./modules/auth/auth.module");
const contacts_module_1 = require("./modules/contacts/contacts.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const ai_module_1 = require("./modules/ai/ai.module");
const email_module_1 = require("./modules/email/email.module");
const cron_module_1 = require("./modules/cron/cron.module");
const sequences_module_1 = require("./modules/sequences/sequences.module");
const diagnostics_module_1 = require("./modules/diagnostics/diagnostics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            contacts_module_1.ContactsModule,
            tasks_module_1.TasksModule,
            ai_module_1.AiModule,
            email_module_1.EmailModule,
            cron_module_1.CronModule,
            sequences_module_1.SequencesModule,
            diagnostics_module_1.DiagnosticsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map