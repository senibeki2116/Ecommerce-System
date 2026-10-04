import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE PRODUCT
  async create(createProductDto: CreateProductDto) {
    // Check category if one was provided
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: createProductDto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });
  }

  // GET ALL PRODUCTS
  async findAll() {
    const products = await this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    return products.map((product) => {
      const totalReviews = product.reviews.length;

      const averageRating =
        totalReviews > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          : 0;

      const { reviews, ...productData } = product;

      return {
        ...productData,
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
      };
    });
  }

  // GET ONE PRODUCT
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const totalReviews = product.reviews.length;

    const averageRating =
      totalReviews > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    const { reviews, ...productData } = product;

    return {
      ...productData,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
    };
  }

  // UPDATE PRODUCT
  async update(id: number, updateProductDto: CreateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check category if one was provided
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: updateProductDto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });
  }

  // DELETE PRODUCT
  async remove(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
