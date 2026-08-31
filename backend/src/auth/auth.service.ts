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

  // =========================
  // REGISTER
  // =========================
  async register(registerDto: RegisterDto) {
    try {
      const { name, email, password } = registerDto;

      // Check if email already exists
      const existingUser = await this.usersService.findByEmail(email);

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await this.usersService.createUser({
        name,
        email,
        password: hashedPassword,
      });

      // Never return the password
      return {
        message: 'User registered successfully',
        user,
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

  // =========================
  // LOGIN
  // =========================
  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      // Find user
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Compare password
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // JWT payload
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      // Create JWT
      const accessToken = await this.jwtService.signAsync(payload);

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
