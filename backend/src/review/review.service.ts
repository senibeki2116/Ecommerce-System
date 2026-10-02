import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // CREATE REVIEW
  // =========================================================
  async create(
    userId: number,
    productId: number,
    createReviewDto: CreateReviewDto,
  ) {
    // -------------------------------------------------------
    // CHECK IF PRODUCT EXISTS
    // -------------------------------------------------------
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // -------------------------------------------------------
    // CHECK IF USER PURCHASED AND RECEIVED THE PRODUCT
    // -------------------------------------------------------
    const purchasedProduct = await this.prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          userId: userId,
          status: 'DELIVERED',
        },
      },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!purchasedProduct) {
      throw new ForbiddenException(
        'You can only review products you have purchased and received',
      );
    }

    // -------------------------------------------------------
    // CHECK IF USER ALREADY REVIEWED THIS PRODUCT
    // -------------------------------------------------------
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this product');
    }

    // -------------------------------------------------------
    // CREATE REVIEW
    // -------------------------------------------------------
    const review = await this.prisma.review.create({
      data: {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        userId: userId,
        productId: productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return review;
  }

  // =========================================================
  // GET ALL REVIEWS FOR A PRODUCT
  // =========================================================
  async findByProduct(productId: number, sort: string = 'newest') {
    // -------------------------------------------------------
    // CHECK IF PRODUCT EXISTS
    // -------------------------------------------------------
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // -------------------------------------------------------
    // DETERMINE SORT ORDER
    // -------------------------------------------------------
    let orderBy: { createdAt: 'asc' | 'desc' } | { rating: 'asc' | 'desc' };

    switch (sort) {
      case 'oldest':
        orderBy = {
          createdAt: 'asc',
        };
        break;

      case 'highest':
        orderBy = {
          rating: 'desc',
        };
        break;

      case 'lowest':
        orderBy = {
          rating: 'asc',
        };
        break;

      case 'newest':
      default:
        orderBy = {
          createdAt: 'desc',
        };
        break;
    }

    // -------------------------------------------------------
    // GET REVIEWS
    // -------------------------------------------------------
    const reviews = await this.prisma.review.findMany({
      where: {
        productId: productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
    });

    // -------------------------------------------------------
    // CALCULATE TOTAL REVIEWS
    // -------------------------------------------------------
    const totalReviews = reviews.length;

    // -------------------------------------------------------
    // CALCULATE AVERAGE RATING
    // -------------------------------------------------------
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // -------------------------------------------------------
    // RETURN RESPONSE
    // -------------------------------------------------------
    return {
      productId,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      sort,
      reviews,
    };
  }

  // =========================================================
  // GET CURRENT USER'S REVIEW FOR A PRODUCT
  // =========================================================
  async findUserReview(userId: number, productId: number) {
    const review = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  // =========================================================
  // UPDATE REVIEW
  // =========================================================
  async update(
    userId: number,
    reviewId: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    // -------------------------------------------------------
    // FIND REVIEW
    // -------------------------------------------------------
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // -------------------------------------------------------
    // MAKE SURE USER OWNS THE REVIEW
    // -------------------------------------------------------
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own review');
    }

    // -------------------------------------------------------
    // UPDATE REVIEW
    // -------------------------------------------------------
    return this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating: updateReviewDto.rating,
        comment: updateReviewDto.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // =========================================================
  // DELETE REVIEW
  // =========================================================
  async remove(userId: number, reviewId: number) {
    // -------------------------------------------------------
    // FIND REVIEW
    // -------------------------------------------------------
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // -------------------------------------------------------
    // MAKE SURE USER OWNS THE REVIEW
    // -------------------------------------------------------
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own review');
    }

    // -------------------------------------------------------
    // DELETE REVIEW
    // -------------------------------------------------------
    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    return {
      message: 'Review deleted successfully',
    };
  }
}
