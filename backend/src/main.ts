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
    ? [
        process.env.FRONTEND_URL,
        'https://fortnite-web-production.up.railway.app',
        // Permite qualquer subdomínio do Railway em produção
      ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:5174'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (como Postman, curl)
      if (!origin) return callback(null, true);

      // Em produção, permite qualquer domínio .railway.app
      if (process.env.NODE_ENV === 'production' && origin.includes('.railway.app')) {
        return callback(null, true);
      }

      // Verifica lista de origens permitidas
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
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
