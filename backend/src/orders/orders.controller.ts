import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create an order from the current user's cart
  @Post()
  createOrder(@Req() req: any) {
    return this.ordersService.createOrder(req.user.id);
  }

  // Get current user's orders
  @Get()
  getMyOrders(@Req() req: any) {
    return this.ordersService.getMyOrders(req.user.id);
  }

  // Get one order belonging to the current user
  @Get(':id')
  getMyOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getMyOrder(req.user.id, id);
  }

  // Cancel a pending order
  @Patch(':id/cancel')
  cancelOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancelOrder(req.user.id, id);
  }
}
