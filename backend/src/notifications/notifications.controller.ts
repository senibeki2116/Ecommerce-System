import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // =========================================================
  // GET ALL NOTIFICATIONS FOR CURRENT USER
  // =========================================================
  @Get()
  async getNotifications(@Req() req: any) {
    const userId = Number(req.user.id);

    return this.notificationsService.getNotifications(userId);
  }

  // =========================================================
  // GET UNREAD NOTIFICATION COUNT
  // =========================================================
  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = Number(req.user.id);

    return {
      count: await this.notificationsService.getUnreadCount(userId),
    };
  }

  // =========================================================
  // GET ADMIN LIVE ALERTS
  // =========================================================
  @Get('admin/alerts')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getAdminAlerts() {
    return this.notificationsService.getAdminAlerts();
  }

  // =========================================================
  // MARK ALL AS READ
  // IMPORTANT: KEEP THIS BEFORE /:id/read
  // =========================================================
  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = Number(req.user.id);

    return this.notificationsService.markAllAsRead(userId);
  }

  // =========================================================
  // MARK ONE NOTIFICATION AS READ
  // =========================================================
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = Number(req.user.id);

    return this.notificationsService.markAsRead(Number(id), userId);
  }

  // =========================================================
  // DELETE ONE NOTIFICATION
  // =========================================================
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = Number(req.user.id);

    return this.notificationsService.remove(Number(id), userId);
  }
}
