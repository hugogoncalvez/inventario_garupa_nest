import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { InventarioModule } from './inventario/inventario.module';

@Module({
  imports: [
    PrismaModule, // 👈 ACÁ
    AuthModule,
    InventarioModule,
  ],
})
export class AppModule { }
