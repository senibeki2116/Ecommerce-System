import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // =========================================================
  // CUSTOMER
  // =========================================================

  @Get('order/:orderId')
  getOrderPayment(
    @Req() req: any,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.paymentsService.findByOrder(req.user.id, orderId);
  }

  // =========================================================
  // ADMIN - ALL PAYMENTS
  // =========================================================

  @Get('admin/all')
  getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  // =========================================================
  // ADMIN - ONE PAYMENT
  // =========================================================

  @Get('admin/:id')
  getAdminPayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.getAdminPayment(id);
  }

  // =========================================================
  // CUSTOMER PAYMENT
  // =========================================================

  @Get(':id')
  getPayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  // =========================================================
  // ADMIN - UPDATE PAYMENT
  // =========================================================

  @Patch('admin/:id/status')
  updateAdminPaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateAdminPaymentStatus(id, dto);
  }

  // =========================================================
  // CUSTOMER - UPDATE PAYMENT
  // =========================================================

  @Patch(':id/status')
  updatePaymentStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateStatus(req.user.id, id, dto);
  }
}
