import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AdminController } from './admin/admin.controller';
import { ProductsModule } from './products/products.module';
@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ProductsModule],
  controllers: [AppController, AdminController],
  providers: [AppService],
})
export class AppModule {}
