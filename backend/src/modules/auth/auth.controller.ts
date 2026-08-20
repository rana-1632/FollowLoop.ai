import { Controller, Post, Body, Get, Put, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User account successfully created' })
  @ApiResponse({ status: 409, description: 'Email address already registered' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and return JWT bearer token' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid login credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve currently authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized / Missing token' })
  async getProfile(@GetUser('id') userId: string) {
    if (!userId) throw new UnauthorizedException('Authentication required.');
    const userProfile = await this.authService.getUserById(userId);
    return { user: userProfile };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated user profile (name, company, avatarUrl)' })
  @ApiResponse({ status: 200, description: 'Profile successfully updated and persisted to database' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    if (!userId) throw new UnauthorizedException('Authentication required.');
    return this.authService.updateProfile(userId, dto);
  }
}
