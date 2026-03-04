import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilitar CORS de forma robusta
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: frontendUrl === '*' ? true : (frontendUrl || 'http://localhost:3000'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
