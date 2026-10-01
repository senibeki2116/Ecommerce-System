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
  // GET ONE PAYMENT
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
  // GET PAYMENT BY ORDER
  //
  // If the order does not have a payment record yet,
  // automatically create one.
  // =========================================================
  async findByOrder(userId: number, orderId: number) {
    // First make sure the order belongs to the logged-in user.
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Try to find the existing payment.
    let payment = await this.prisma.payment.findUnique({
      where: {
        orderId,
      },
      include: {
        order: true,
      },
    });

    // =======================================================
    // CREATE MISSING PAYMENT
    // =======================================================
    if (!payment) {
      let paymentMethodEnum: 'CASH_ON_DELIVERY' | 'TELEBIRR' | 'CARD';

      switch (order.paymentMethod) {
        case 'Telebirr':
          paymentMethodEnum = 'TELEBIRR';
          break;

        case 'Credit / Debit Card':
          paymentMethodEnum = 'CARD';
          break;

        case 'Cash on Delivery':
        default:
          paymentMethodEnum = 'CASH_ON_DELIVERY';
          break;
      }

      payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method: paymentMethodEnum,
          status: 'PENDING',
          transactionId: null,
        },
        include: {
          order: true,
        },
      });
    }

    return payment;
  }

  // =========================================================
  // UPDATE USER PAYMENT STATUS
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

    // Make sure the payment belongs to the logged-in user.
    if (payment.order.userId !== userId) {
      throw new NotFoundException('Payment not found');
    }

    // Do not allow changing an already paid payment.
    if (payment.status === 'PAID') {
      throw new BadRequestException('A paid payment cannot be changed');
    }

    // Do not allow changing a cancelled payment.
    if (payment.status === 'CANCELLED') {
      throw new BadRequestException('A cancelled payment cannot be changed');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update payment.
      const updatedPayment = await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: dto.status,
        },
      });

      // Determine corresponding order status.
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

      // Update order.
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
  // GET ALL PAYMENTS - ADMIN
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
  // GET ONE PAYMENT - ADMIN
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
  // UPDATE PAYMENT STATUS - ADMIN
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

    // Do not allow changing already paid payments.
    if (payment.status === 'PAID') {
      throw new BadRequestException('A paid payment cannot be changed');
    }

    // Do not allow changing cancelled payments.
    if (payment.status === 'CANCELLED') {
      throw new BadRequestException('A cancelled payment cannot be changed');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Determine corresponding order status.
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

      // Update payment.
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

      // Update order.
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
