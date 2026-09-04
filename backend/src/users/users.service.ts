import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Find user by email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Create a new user
  async createUser(data: { name: string; email: string; password: string }) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Get all users
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

  // Get one user with their orders
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

  // Change user role
  async updateUserRole(id: number, role: 'CUSTOMER' | 'ADMIN') {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        role,
      },
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

  // Delete user safely
  async deleteUser(id: number, currentUserId: number) {
    // Prevent admin from deleting their own account
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    // Find user and related data
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    // Delete cart items
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

    // Delete order items
    for (const order of user.orders) {
      await this.prisma.orderItem.deleteMany({
        where: {
          orderId: order.id,
        },
      });
    }

    // Delete user's orders
    await this.prisma.order.deleteMany({
      where: {
        userId: id,
      },
    });

    // Finally delete the user
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
