import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================================
  // REGISTER
  // POST /auth/register
  // ==========================================
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ==========================================
  // LOGIN
  // POST /auth/login
  // ==========================================
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // ==========================================
  // PROFILE
  // GET /auth/profile
  //
  // CUSTOMER and ADMIN can access this.
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return {
      message: 'Authenticated successfully',
      user: req.user,
    };
  }

  // ==========================================
  // ADMIN TEST
  // GET /auth/admin-test
  //
  // Only ADMIN can access this.
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-test')
  adminTest(@Req() req: any) {
    return {
      message: 'Welcome Admin!',
      user: req.user,
    };
  }
}
