import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    
    // Eliminamos el heartbeat y el constructor manual
    // Dejamos que Prisma maneje el pool de forma nativa y eficiente.

    async onModuleInit() {
        console.log('--- CONECTANDO A CLEVER CLOUD (Límite Estricto) ---');
        try {
            await this.$connect();
            console.log('✅ BASE DE DATOS CONECTADA');
        } catch (error) {
            console.error('❌ ERROR DE CONEXIÓN:', error.message);
        }
    }

    async onModuleDestroy() {
        console.log('--- LIBERANDO CONEXIÓN ---');
        await this.$disconnect();
        console.log('✅ CONEXIÓN CERRADA');
    }
}
