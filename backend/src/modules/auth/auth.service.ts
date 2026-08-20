import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email address or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email address or password');
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

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
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

  async getUserById(userId: string) {
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

    if (!user) return null;

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

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
