import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Get current user's cart
  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  // Add product to cart
  @Post()
  addToCart(
    @Req() req: any,
    @Body() body: { productId: number; quantity: number },
  ) {
    return this.cartService.addToCart(
      req.user.id,
      Number(body.productId),
      Number(body.quantity),
    );
  }

  // Update product quantity
  @Patch(':productId')
  updateQuantity(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(
      req.user.id,
      productId,
      Number(body.quantity),
    );
  }

  // Remove product from cart
  @Delete(':productId')
  removeFromCart(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeFromCart(req.user.id, productId);
  }

  // Clear cart
  @Delete()
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
