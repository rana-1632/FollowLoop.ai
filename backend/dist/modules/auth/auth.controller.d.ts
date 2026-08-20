import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(userId: string): Promise<{
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
}
