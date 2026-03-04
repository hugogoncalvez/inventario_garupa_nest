import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { InventarioModule } from './inventario/inventario.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule, // 👈 ACÁ
    AuthModule,
    InventarioModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
