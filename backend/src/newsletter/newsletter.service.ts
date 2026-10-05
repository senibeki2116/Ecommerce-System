import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingSubscriber =
      await this.prisma.newsletterSubscriber.findUnique({
        where: {
          email,
        },
      });

    if (existingSubscriber) {
      throw new ConflictException(
        'This email is already subscribed to our newsletter.',
      );
    }

    const subscriber = await this.prisma.newsletterSubscriber.create({
      data: {
        email,
      },
    });

    return {
      success: true,
      message: 'Successfully subscribed to the E-Shop newsletter.',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        createdAt: subscriber.createdAt,
      },
    };
  }

  async getSubscribers() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
