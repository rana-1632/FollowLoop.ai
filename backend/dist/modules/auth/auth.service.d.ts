import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            fullName: string;
            company: string;
            companyName: string;
            avatarUrl: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            fullName: string;
            company: string;
            companyName: string;
            avatarUrl: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            fullName: string;
            company: string;
            companyName: string;
            avatarUrl: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
    }>;
    getUserById(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        fullName: string;
        company: string;
        companyName: string;
        avatarUrl: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    private generateToken;
}
