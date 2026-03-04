import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configuración de CORS simplificada y explícita
  const frontendUrl = process.env.FRONTEND_URL;
  console.log('REINICIANDO SERVIDOR - CONFIGURACIÓN:', { frontendUrl, nodeEnv: process.env.NODE_ENV });

  app.enableCors({
    origin: [
      'https://inventario-garupa-nest.vercel.app',
      'http://localhost:3000',
      frontendUrl,
    ].filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
  });

  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(`Servidor activo en puerto ${port}`);
}
bootstrap();
