import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilitar CORS de forma ultra-robusta
  const frontendUrl = process.env.FRONTEND_URL;
  console.log('--- CONFIGURACIÓN DE PRODUCCIÓN ---');
  console.log('FRONTEND_URL configurada:', frontendUrl);
  console.log('PORT configurado:', process.env.PORT);

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://inventario-garupa-nest.vercel.app',
        frontendUrl,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin) || frontendUrl === '*') {
        callback(null, true);
      } else {
        console.warn(`Origen no permitido por CORS: ${origin}`);
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(`Servidor escuchando en puerto ${port}`);
}
bootstrap();
