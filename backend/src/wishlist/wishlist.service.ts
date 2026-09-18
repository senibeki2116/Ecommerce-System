import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // GET MY WISHLIST
  // ==========================================
  async getWishlist(userId: number) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: {
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

    // Create wishlist automatically if it doesn't exist
    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
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

    return wishlist;
  }

  // ==========================================
  // ADD PRODUCT TO WISHLIST
  // ==========================================
  async addToWishlist(userId: number, productId: number) {
    // Check product exists
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Find or create wishlist
    let wishlist = await this.prisma.wishlist.findUnique({
      where: {
        userId,
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: {
          userId,
        },
      });
    }

    // Check whether product is already in wishlist
    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existingItem) {
      return {
        message: 'Product is already in your wishlist',
        item: existingItem,
      };
    }

    const item = await this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: {
        product: true,
      },
    });

    return {
      message: 'Product added to wishlist',
      item,
    };
  }

  // ==========================================
  // REMOVE PRODUCT FROM WISHLIST
  // ==========================================
  async removeFromWishlist(userId: number, productId: number) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: {
        userId,
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Product is not in your wishlist');
    }

    await this.prisma.wishlistItem.delete({
      where: {
        id: item.id,
      },
    });

    return {
      message: 'Product removed from wishlist',
    };
  }

  // ==========================================
  // CHECK PRODUCT
  // ==========================================
  async isInWishlist(userId: number, productId: number) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: {
        userId,
      },
    });

    if (!wishlist) {
      return {
        inWishlist: false,
      };
    }

    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    return {
      inWishlist: !!item,
    };
  }
}
