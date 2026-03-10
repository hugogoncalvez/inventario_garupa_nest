import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {

    async onModuleInit() {
        // Eliminamos el await this.$connect() de aquí para evitar fallos en el arranque
        // Prisma conectará automáticamente en la primera consulta.
        console.log('--- PRISMA SERVICE INICIALIZADO (CONEXIÓN BAJO DEMANDA) ---');
    }

    async onModuleDestroy() {
        console.log('--- LIBERANDO CONEXIÓN ---');
        try {
            await this.$disconnect();
            console.log('✅ CONEXIÓN CERRADA');
        } catch (error) {
            console.error('Error al cerrar conexión:', error.message);
        }
    }
}
