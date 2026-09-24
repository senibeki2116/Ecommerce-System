import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

export type OrderStatusValue =
  'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // =========================================================
  // CUSTOMER - CREATE ORDER
  // =========================================================

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const {
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      customer,
      shippingAddress,
      paymentMethod,
    } = createOrderDto;

    // ---------------------------------------------------------
    // Validate items
    // ---------------------------------------------------------

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const productIds = items.map((item) => item.productId);

    // ---------------------------------------------------------
    // Get products
    // ---------------------------------------------------------

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products do not exist');
    }

    // ---------------------------------------------------------
    // Check stock
    // ---------------------------------------------------------

    for (const item of items) {
      const product = products.find((product) => product.id === item.productId);

      if (!product) {
        throw new BadRequestException(
          `Product ${item.productId} does not exist`,
        );
      }

      if (item.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than zero');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${product.name}`);
      }
    }

    // ---------------------------------------------------------
    // Calculate product subtotal from database prices
    // ---------------------------------------------------------
    // We calculate this again from the database instead of
    // trusting the frontend price values.

    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = products.find((product) => product.id === item.productId);

      if (product) {
        calculatedSubtotal += product.price * item.quantity;
      }
    }

    // ---------------------------------------------------------
    // Use checkout values when available
    // ---------------------------------------------------------

    const finalSubtotal =
      typeof subtotal === 'number' ? subtotal : calculatedSubtotal;

    const finalShipping = typeof shipping === 'number' ? shipping : 0;

    const finalTax = typeof tax === 'number' ? tax : 0;

    const finalDiscount = typeof discount === 'number' ? discount : 0;

    const calculatedTotal =
      finalSubtotal + finalShipping + finalTax - finalDiscount;

    const finalTotal = typeof total === 'number' ? total : calculatedTotal;

    // ---------------------------------------------------------
    // Create order + reduce stock
    // ---------------------------------------------------------

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,

          status: 'PENDING',

          // -----------------------------------------------
          // ORDER AMOUNTS
          // -----------------------------------------------

          subtotal: finalSubtotal,
          shipping: finalShipping,
          tax: finalTax,
          discount: finalDiscount,
          total: finalTotal,

          // -----------------------------------------------
          // CUSTOMER INFORMATION
          // -----------------------------------------------

          firstName: customer?.firstName || null,
          lastName: customer?.lastName || null,
          email: customer?.email || null,
          phone: customer?.phone || null,

          // -----------------------------------------------
          // DELIVERY ADDRESS
          // -----------------------------------------------

          address: shippingAddress?.address || null,
          city: shippingAddress?.city || null,
          country: shippingAddress?.country || null,

          deliveryInstructions: shippingAddress?.deliveryInstructions || null,

          // -----------------------------------------------
          // PAYMENT
          // -----------------------------------------------

          paymentMethod: paymentMethod || null,

          // -----------------------------------------------
          // ORDER ITEMS
          // -----------------------------------------------

          items: {
            create: items.map((item) => {
              const product = products.find(
                (product) => product.id === item.productId,
              );

              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product?.price || 0,
              };
            }),
          },
        },

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
      });

      // -----------------------------------------------------
      // Reduce product stock
      // -----------------------------------------------------

      for (const item of items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  }

  // =========================================================
  // CUSTOMER - GET MY ORDERS
  // =========================================================

  async findAll(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },

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
    });
  }

  // =========================================================
  // ADMIN - GET ALL ORDERS
  // =========================================================

  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },

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
    });
  }

  // =========================================================
  // CUSTOMER - GET ONE ORDER
  // =========================================================

  async findOne(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },

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
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // =========================================================
  // ADMIN - GET ONE ORDER
  // =========================================================

  async getOrder(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },

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
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // =========================================================
  // ADMIN - UPDATE ORDER STATUS
  // =========================================================

  async updateOrderStatus(orderId: number, status: OrderStatusValue) {
    const validStatuses: OrderStatusValue[] = [
      'PENDING',
      'CONFIRMED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const order = await this.getOrder(orderId);

    // ---------------------------------------------------------
    // Same status
    // ---------------------------------------------------------

    if (order.status === status) {
      return order;
    }

    // ---------------------------------------------------------
    // Delivered order cannot be changed
    // ---------------------------------------------------------

    if (order.status === 'DELIVERED') {
      throw new BadRequestException('A delivered order cannot be changed');
    }

    // ---------------------------------------------------------
    // Cancelled order cannot be changed
    // ---------------------------------------------------------

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('A cancelled order cannot be changed');
    }

    // ---------------------------------------------------------
    // ADMIN CANCELS ORDER
    // Return products to stock
    // ---------------------------------------------------------

    if (status === 'CANCELLED') {
      const cancelledOrder = await this.prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: {
            id: orderId,
          },

          data: {
            status: 'CANCELLED',
          },

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
        });

        // Return cancelled products to stock

        for (const item of order.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },

            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return updatedOrder;
      });

      return cancelledOrder;
    }

    // ---------------------------------------------------------
    // NORMAL STATUS UPDATE
    // ---------------------------------------------------------

    return this.prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status,
      },

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
    });
  }

  // =========================================================
  // CUSTOMER - CANCEL ORDER
  // =========================================================

  async cancel(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // ---------------------------------------------------------
    // Only pending and confirmed orders can be cancelled
    // ---------------------------------------------------------

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      throw new BadRequestException('This order cannot be cancelled');
    }

    // ---------------------------------------------------------
    // Cancel + return stock
    // ---------------------------------------------------------

    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: orderId,
        },

        data: {
          status: 'CANCELLED',
        },

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
      });

      // Return products to stock

      for (const item of order.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return updatedOrder;
    });

    return cancelledOrder;
  }
}
