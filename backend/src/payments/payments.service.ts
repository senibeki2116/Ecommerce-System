import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  PaymentStatusDto,
  UpdatePaymentStatusDto,
} from './dto/update-payment-status.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // =========================================================
  // CUSTOMER - GET ONE PAYMENT
  // =========================================================

  async findOne(paymentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },

      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  // =========================================================
  // CUSTOMER - GET PAYMENT BY ORDER
  // =========================================================

  async findByOrder(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payment = await this.prisma.payment.findUnique({
      where: {
        orderId,
      },

      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    return payment;
  }

  // =========================================================
  // CUSTOMER - UPDATE PAYMENT STATUS
  // =========================================================

  async updateStatus(
    userId: number,
    paymentId: number,
    dto: UpdatePaymentStatusDto,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },

      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.order.userId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('A paid payment cannot be changed');
    }

    if (payment.status === 'CANCELLED') {
      throw new BadRequestException('A cancelled payment cannot be changed');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: paymentId,
        },

        data: {
          status: dto.status,
        },
      });

      let orderStatus = payment.order.status;

      if (dto.status === PaymentStatusDto.PAID) {
        orderStatus = 'CONFIRMED';
      }

      if (dto.status === PaymentStatusDto.FAILED) {
        orderStatus = 'PENDING';
      }

      if (dto.status === PaymentStatusDto.CANCELLED) {
        orderStatus = 'CANCELLED';
      }

      await tx.order.update({
        where: {
          id: payment.orderId,
        },

        data: {
          status: orderStatus,
        },
      });

      return updatedPayment;
    });

    return this.findOne(result.id);
  }

  // =========================================================
  // ADMIN - GET ALL PAYMENTS
  // =========================================================

  async getAllPayments() {
    return this.prisma.payment.findMany({
      orderBy: {
        createdAt: 'desc',
      },

      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  // =========================================================
  // ADMIN - GET ONE PAYMENT
  // =========================================================

  async getAdminPayment(paymentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },

      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  // =========================================================
  // ADMIN - UPDATE PAYMENT STATUS
  // =========================================================

  async updateAdminPaymentStatus(
    paymentId: number,
    dto: UpdatePaymentStatusDto,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },

      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('A paid payment cannot be changed');
    }

    if (payment.status === 'CANCELLED') {
      throw new BadRequestException('A cancelled payment cannot be changed');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      let orderStatus = payment.order.status;

      if (dto.status === PaymentStatusDto.PAID) {
        orderStatus = 'CONFIRMED';
      }

      if (dto.status === PaymentStatusDto.FAILED) {
        orderStatus = 'PENDING';
      }

      if (dto.status === PaymentStatusDto.CANCELLED) {
        orderStatus = 'CANCELLED';
      }

      const updatedPayment = await tx.payment.update({
        where: {
          id: paymentId,
        },

        data: {
          status: dto.status,
        },

        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      await tx.order.update({
        where: {
          id: payment.orderId,
        },

        data: {
          status: orderStatus,
        },
      });

      return updatedPayment;
    });

    return result;
  }
}
