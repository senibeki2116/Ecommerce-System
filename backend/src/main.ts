import { NestFactory } from '@nestjs/core';
import { networkInterfaces } from 'node:os';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT ?? 3001);

  const frontendOrigins = [
    ...(process.env.FRONTEND_URL ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ];

  const machineIpv4Addresses = new Set(
    Object.values(networkInterfaces())
      .flatMap((addresses) => addresses ?? [])
      .filter((address) => address.family === 'IPv4')
      .map((address) => address.address),
  );

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

      const isLoopback =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]' ||
        hostname === '::1';
      const isLocalNetworkFrontend =
        origin.startsWith('http://') &&
        new URL(origin).port === '3000' &&
        machineIpv4Addresses.has(hostname);

      callback(null, isLoopback || isLocalNetworkFrontend);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');

  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
