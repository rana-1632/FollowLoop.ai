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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tasks_service_1 = require("./tasks.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../../common/decorators/get-user.decorator");
const client_1 = require("@prisma/client");
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async create(userId, dto) {
        return this.tasksService.create(userId, dto);
    }
    async findAll(userId, status, overdue) {
        const isOverdue = overdue === 'true';
        return this.tasksService.findAll(userId, status, isOverdue);
    }
    async findOne(userId, id) {
        return this.tasksService.findOne(userId, id);
    }
    async update(userId, id, dto) {
        return this.tasksService.update(userId, id, dto);
    }
    async remove(userId, id) {
        return this.tasksService.remove(userId, id);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a new follow-up task' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Follow-up task created' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List follow-up tasks for current user' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.TaskStatus, required: false, description: 'Filter by task status' }),
    (0, swagger_1.ApiQuery)({ name: 'overdue', type: Boolean, required: false, description: 'Only show overdue pending tasks' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of follow-up tasks' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('overdue')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get details for a single task' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task detail returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task not found' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update follow-up task status, draft, or due date' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task updated successfully' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete follow-up task' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task deleted successfully' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('Follow-Up Tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map