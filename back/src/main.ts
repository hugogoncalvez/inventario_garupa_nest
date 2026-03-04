import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilitar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // React app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // si envías cookies o headers de auth
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
