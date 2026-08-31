import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
export class AdminController {
  @Get('test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  testAdmin() {
    return {
      message: 'ADMIN route is working!',
    };
  }
}
