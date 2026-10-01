import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // =========================================================
  // CREATE REVIEW
  // =========================================================
  @UseGuards(JwtAuthGuard)
  @Post(':productId')
  create(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(req.user.id, productId, createReviewDto);
  }

  // =========================================================
  // GET REVIEWS FOR A PRODUCT
  // =========================================================
  @Get('product/:productId')
  findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('sort') sort?: string,
  ) {
    return this.reviewService.findByProduct(productId, sort || 'newest');
  }

  // =========================================================
  // GET CURRENT USER'S REVIEW
  // =========================================================
  @UseGuards(JwtAuthGuard)
  @Get('my/:productId')
  findUserReview(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.reviewService.findUserReview(req.user.id, productId);
  }

  // =========================================================
  // UPDATE REVIEW
  // =========================================================
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.update(req.user.id, reviewId, updateReviewDto);
  }

  // =========================================================
  // DELETE REVIEW
  // =========================================================
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) reviewId: number) {
    return this.reviewService.remove(req.user.id, reviewId);
  }
}
