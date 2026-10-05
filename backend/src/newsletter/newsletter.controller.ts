import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  // Public endpoint — anyone can subscribe.
  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(dto);
  }

  // Admin-only endpoint — subscriber emails are protected.
  @Get('subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSubscribers() {
    return this.newsletterService.getSubscribers();
  }
}
