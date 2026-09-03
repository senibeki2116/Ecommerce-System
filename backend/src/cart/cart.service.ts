import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // ================================
  // GET USER CART
  // ================================
  async getCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create cart if user doesn't have one
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
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
    }

    return cart;
  }

  // ================================
  // ADD PRODUCT TO CART
  // ================================
  async addToCart(userId: number, productId: number, quantity: number) {
    console.log('=================================');
    console.log('ADD TO CART RECEIVED:', {
      userId,
      productId,
      quantity,
    });
    console.log('=================================');

    // Validate quantity
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // Find product
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    console.log('PRODUCT FOUND:', product);

    // Product doesn't exist
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check stock
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Not enough stock available. Only ${product.stock} left.`,
      );
    }

    // Find user's cart
    let cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
      });

      console.log('NEW CART CREATED:', cart.id);
    }

    // Check if product already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    // Product already in cart
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      console.log('EXISTING CART ITEM:', existingItem);
      console.log('NEW QUANTITY:', newQuantity);

      // Check stock for new quantity
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Not enough stock available. Only ${product.stock} available.`,
        );
      }

      const updatedItem = await this.prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
        },
      });

      console.log('CART ITEM UPDATED:', updatedItem);

      return updatedItem;
    }

    // Add new product to cart
    const newItem = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });

    console.log('NEW CART ITEM CREATED:', newItem);

    return newItem;
  }

  // ================================
  // UPDATE QUANTITY
  // ================================
  async updateQuantity(userId: number, productId: number, quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Product is not in cart');
    }

    if (quantity > item.product.stock) {
      throw new BadRequestException(
        `Not enough stock available. Only ${item.product.stock} available.`,
      );
    }

    return this.prisma.cartItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  // ================================
  // REMOVE PRODUCT
  // ================================
  async removeFromCart(userId: number, productId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Product is not in cart');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return {
      message: 'Product removed from cart successfully',
    };
  }

  // ================================
  // CLEAR CART
  // ================================
  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {
      message: 'Cart cleared successfully',
    };
  }
}
