import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';

const globalAny = globalThis as unknown as {
  crypto?: { randomUUID?: () => string };
};

if (!globalAny.crypto) {
  globalAny.crypto = { randomUUID };
} else if (!globalAny.crypto.randomUUID) {
  globalAny.crypto.randomUUID = randomUUID;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5173', 'http://localhost:5174'];

  app.enableCors({
    origin: allowedOrigins.filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
