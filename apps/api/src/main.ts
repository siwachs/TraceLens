import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // When the API receives SIGTERM, which is what Docker, ECS and a deploy send, Nest doesn’t run its shutdown lifecycle and the process dies immediately.
  const app = await NestFactory.create(AppModule);

  // On SIGTERM or SIGINT, Nest stops accepting new connections, lets in-flight requests finish, then runs onModuleDestroy hooks and exits.
  app.enableShutdownHooks();

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:5173',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
