import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderStatusValue, OrdersService } from '../orders/orders.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly ordersService: OrdersService) {}

  // Test admin access
  @Get('test')
  testAdmin() {
    return {
      message: 'ADMIN route is working!',
    };
  }

  // Get all orders
  @Get('orders')
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  // Get one order
  @Get('orders/:id')
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrder(id);
  }

  // Update order status
  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: OrderStatusValue },
  ) {
    return this.ordersService.updateOrderStatus(id, body.status);
  }
}
