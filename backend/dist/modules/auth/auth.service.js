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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('An account with this email address already exists');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(dto.password, saltRounds);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                fullName: dto.fullName,
                companyName: dto.companyName,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                companyName: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
            },
        });
        const accessToken = this.generateToken(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.fullName || user.email.split('@')[0],
                fullName: user.fullName,
                company: user.companyName,
                companyName: user.companyName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                createdAt: user.createdAt,
            },
            accessToken,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email address or password');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email address or password');
        }
        const accessToken = this.generateToken(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.fullName || user.email.split('@')[0],
                fullName: user.fullName,
                company: user.companyName,
                companyName: user.companyName,
                avatarUrl: user.avatarUrl,
                role: user.role,
                createdAt: user.createdAt,
            },
            accessToken,
        };
    }
    async updateProfile(userId, dto) {
        if (!userId) {
            throw new common_1.UnauthorizedException('Authentication required.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User profile not found');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                fullName: dto.fullName !== undefined ? dto.fullName : user.fullName,
                companyName: dto.companyName !== undefined ? dto.companyName : user.companyName,
                avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                companyName: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
            },
        });
        return {
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.fullName || updatedUser.email.split('@')[0],
                fullName: updatedUser.fullName,
                company: updatedUser.companyName,
                companyName: updatedUser.companyName,
                avatarUrl: updatedUser.avatarUrl,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
            },
        };
    }
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                companyName: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            name: user.fullName || user.email.split('@')[0],
            fullName: user.fullName,
            company: user.companyName,
            companyName: user.companyName,
            avatarUrl: user.avatarUrl,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
    generateToken(userId, email, role) {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map