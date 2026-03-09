// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   console.log('*** INICIANDO BOOTSTRAP DEL SERVIDOR ***');
//   try {
//     const app = await NestFactory.create(AppModule);
//     app.enableShutdownHooks();

//     app.enableCors({
//       origin: true,
//       methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//       credentials: true,
//       allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
//     });

//     const port = process.env.PORT || 8000;
//     console.log(`Intentando escuchar en puerto: ${port} e interfaz 0.0.0.0`);

//     await app.listen(port, '0.0.0.0');
//     console.log(`¡CORRECTO! El servidor está escuchando en el puerto ${port}`);
//   } catch (error) {
//     console.error('*** ERROR CRÍTICO EN EL ARRANQUE ***');
//     console.error(error);
//     process.exit(1);
//   }
// }
// bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('*** INICIANDO BOOTSTRAP DEL SERVIDOR ***');

  try {
    const app = await NestFactory.create(AppModule);

    app.enableShutdownHooks();

    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: '*',
    });

    const port = process.env.PORT || 8000;

    console.log(`Intentando escuchar en puerto: ${port}`);

    await app.listen(port, '0.0.0.0');

    console.log(`✅ Servidor escuchando en puerto ${port}`);

  } catch (error) {
    console.error('*** ERROR CRÍTICO EN EL ARRANQUE ***');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();