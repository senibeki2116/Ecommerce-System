import {
  Body,
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
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // =========================================================
  // CUSTOMER - CREATE ORDER
  // =========================================================

  @Post()
  createOrder(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  // =========================================================
  // CUSTOMER - GET MY ORDERS
  // =========================================================

  @Get()
  getMyOrders(@Req() req: any) {
    return this.ordersService.findAll(req.user.id);
  }

  // =========================================================
  // CUSTOMER - GET ONE ORDER
  // =========================================================

  @Get(':id')
  getMyOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(req.user.id, id);
  }

  // =========================================================
  // CUSTOMER - CANCEL ORDER
  // =========================================================

  @Patch(':id/cancel')
  cancelOrder(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancel(req.user.id, id);
  }
}
