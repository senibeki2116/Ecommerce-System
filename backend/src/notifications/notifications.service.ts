import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId?: number) {
    return this.prisma.notification.findMany({
      where: userId ? { userId } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUnreadCount(userId?: number) {
    return this.prisma.notification.count({
      where: {
        ...(userId ? { userId } : {}),
        isRead: false,
      },
    });
  }

  async markAsRead(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId?: number) {
    return this.prisma.notification.updateMany({
      where: {
        ...(userId ? { userId } : {}),
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async remove(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async createNotification(data: {
    title: string;
    message: string;
    type?: string;
    userId?: number;
  }) {
    return this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type ?? 'INFO',
        userId: data.userId,
      },
    });
  }
}
