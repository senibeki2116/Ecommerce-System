import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ==========================================
  // REGISTER
  // ==========================================
  async register(registerDto: RegisterDto) {
    try {
      const { name, email, password } = registerDto;

      // Check whether email already exists
      const existingUser = await this.usersService.findByEmail(email);

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      /*
       * IMPORTANT:
       * We do NOT accept a role from registration.
       *
       * The UsersService/database will automatically create
       * the user as CUSTOMER.
       */
      const user = await this.usersService.createUser({
        name,
        email,
        password: hashedPassword,
      });

      // Never return password
      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      console.error('====================================');
      console.error('REGISTER ERROR:');
      console.error(error);
      console.error('====================================');

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Something went wrong while registering the user',
      );
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Find user by email
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Compare password
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid email or password');
      }

      /*
       * JWT payload
       *
       * The role is included so RolesGuard can determine
       * whether the user is CUSTOMER or ADMIN.
       */
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      // Generate JWT
      const accessToken = await this.jwtService.signAsync(payload);

      // Return token + safe user information
      return {
        message: 'Login successful',

        accessToken,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('====================================');
      console.error('LOGIN ERROR:');
      console.error(error);
      console.error('====================================');

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Something went wrong while logging in',
      );
    }
  }
}
