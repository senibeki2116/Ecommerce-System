import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // GET NOTIFICATIONS FOR CURRENT USER
  // =========================================================
  async getNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================================
  // GET UNREAD NOTIFICATION COUNT
  // =========================================================
  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // =========================================================
  // MARK ONE NOTIFICATION AS READ
  // =========================================================
  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
  }

  // =========================================================
  // MARK ALL USER NOTIFICATIONS AS READ
  // =========================================================
  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  // =========================================================
  // DELETE ONE NOTIFICATION
  // =========================================================
  async remove(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }

  // =========================================================
  // CREATE NOTIFICATION
  // =========================================================
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

  // =========================================================
  // GET LIVE ADMIN ALERTS
  //
  // These alerts are calculated directly from the database.
  // They do NOT create duplicate Notification records.
  // =========================================================
  async getAdminAlerts() {
    const [
      pendingOrders,
      recentOrders,
      lowStockProducts,
      outOfStockProducts,
      pendingPayments,
      failedPayments,
    ] = await Promise.all([
      // -----------------------------------------------------
      // PENDING ORDERS
      // -----------------------------------------------------
      this.prisma.order.findMany({
        where: {
          status: 'PENDING',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),

      // -----------------------------------------------------
      // RECENT ORDERS
      // -----------------------------------------------------
      this.prisma.order.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),

      // -----------------------------------------------------
      // LOW STOCK PRODUCTS
      // Stock from 1 to 5
      // -----------------------------------------------------
      this.prisma.product.findMany({
        where: {
          stock: {
            gt: 0,
            lte: 5,
          },
        },
        orderBy: {
          stock: 'asc',
        },
        take: 10,
        select: {
          id: true,
          name: true,
          stock: true,
        },
      }),

      // -----------------------------------------------------
      // OUT OF STOCK PRODUCTS
      // -----------------------------------------------------
      this.prisma.product.findMany({
        where: {
          stock: {
            lte: 0,
          },
        },
        orderBy: {
          id: 'desc',
        },
        take: 10,
        select: {
          id: true,
          name: true,
          stock: true,
        },
      }),

      // -----------------------------------------------------
      // PENDING PAYMENTS
      // -----------------------------------------------------
      this.prisma.payment.findMany({
        where: {
          status: 'PENDING',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          orderId: true,
          amount: true,
          method: true,
          status: true,
          createdAt: true,
        },
      }),

      // -----------------------------------------------------
      // FAILED PAYMENTS
      // -----------------------------------------------------
      this.prisma.payment.findMany({
        where: {
          status: 'FAILED',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          orderId: true,
          amount: true,
          method: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // =======================================================
    // RETURN ADMIN ALERT DATA
    // =======================================================

    return {
      summary: {
        pendingOrders: pendingOrders.length,

        lowStockProducts: lowStockProducts.length,

        outOfStockProducts: outOfStockProducts.length,

        pendingPayments: pendingPayments.length,

        failedPayments: failedPayments.length,

        totalAlerts:
          pendingOrders.length +
          lowStockProducts.length +
          outOfStockProducts.length +
          pendingPayments.length +
          failedPayments.length,
      },

      pendingOrders,

      recentOrders,

      lowStockProducts,

      outOfStockProducts,

      pendingPayments,

      failedPayments,
    };
  }
}
