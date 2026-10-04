import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT ?? 3001);

  const frontendOrigins = [
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      let hostname: string;
      try {
        hostname = new URL(origin).hostname;
      } catch {
        callback(null, false);
        return;
      }

      callback(
        null,
        hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === '[::1]' ||
          hostname === '::1',
      );
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');

  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
