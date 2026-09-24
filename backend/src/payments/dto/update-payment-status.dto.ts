import { IsEnum } from 'class-validator';

export enum PaymentStatusDto {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatusDto)
  status!: PaymentStatusDto;
}
