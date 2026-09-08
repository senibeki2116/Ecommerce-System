import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // FIND USER BY EMAIL
  // Used during registration and login
  // =========================================================
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  // =========================================================
  // CREATE USER
  // IMPORTANT:
  // New users are CUSTOMER by default.
  // We do not allow registration to choose ADMIN.
  // =========================================================
  async createUser(data: { name: string; email: string; password: string }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,

        // Always CUSTOMER when registering
        role: Role.CUSTOMER,
      },

      // Never return password
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // =========================================================
  // GET ALL USERS
  // ADMIN ONLY - controller will protect this endpoint
  // =========================================================
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =========================================================
  // GET USER BY ID
  // Includes user's orders
  // =========================================================
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            updatedAt: true,

            items: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                price: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // =========================================================
  // CHANGE USER ROLE
  //
  // CUSTOMER -> ADMIN
  // ADMIN    -> CUSTOMER
  //
  // ADMIN ONLY - controller will protect this endpoint
  // =========================================================
  async updateUserRole(id: number, role: Role) {
    // Check whether user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update role
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },

      data: {
        role,
      },

      // Never return password
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: `User role changed to ${role}`,
      user: updatedUser,
    };
  }

  // =========================================================
  // DELETE USER
  //
  // ADMIN ONLY
  //
  // Deletes:
  // 1. Cart items
  // 2. Cart
  // 3. Order items
  // 4. Orders
  // 5. User
  // =========================================================
  async deleteUser(id: number, currentUserId: number) {
    // -------------------------------------------------------
    // Prevent admin from deleting themselves
    // -------------------------------------------------------
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    // -------------------------------------------------------
    // Find user
    // -------------------------------------------------------
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        cart: {
          include: {
            items: true,
          },
        },

        orders: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // -------------------------------------------------------
    // Delete cart items
    // -------------------------------------------------------
    if (user.cart) {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: user.cart.id,
        },
      });

      // Delete cart
      await this.prisma.cart.delete({
        where: {
          id: user.cart.id,
        },
      });
    }

    // -------------------------------------------------------
    // Delete order items
    // -------------------------------------------------------
    for (const order of user.orders) {
      await this.prisma.orderItem.deleteMany({
        where: {
          orderId: order.id,
        },
      });
    }

    // -------------------------------------------------------
    // Delete user's orders
    // -------------------------------------------------------
    await this.prisma.order.deleteMany({
      where: {
        userId: id,
      },
    });

    // -------------------------------------------------------
    // Finally delete user
    // -------------------------------------------------------
    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      message: 'User deleted successfully',
      userId: id,
    };
  }
}
