import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Req() req: any) {
    const userId = Number(req.user?.id ?? req.user?.sub);

    console.log('WISHLIST USER:', req.user);
    console.log('WISHLIST USER ID:', userId);

    return this.wishlistService.getWishlist(userId);
  }

  @Post(':productId')
  addToWishlist(@Req() req: any, @Param('productId') productId: string) {
    const userId = Number(req.user?.id ?? req.user?.sub);

    return this.wishlistService.addToWishlist(userId, Number(productId));
  }

  @Delete(':productId')
  removeFromWishlist(@Req() req: any, @Param('productId') productId: string) {
    const userId = Number(req.user?.id ?? req.user?.sub);

    return this.wishlistService.removeFromWishlist(userId, Number(productId));
  }

  @Get(':productId/check')
  isInWishlist(@Req() req: any, @Param('productId') productId: string) {
    const userId = Number(req.user?.id ?? req.user?.sub);

    return this.wishlistService.isInWishlist(userId, Number(productId));
  }
}
