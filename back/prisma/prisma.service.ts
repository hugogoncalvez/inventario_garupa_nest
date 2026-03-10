import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {

    constructor() {
        super({
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        console.log('--- PRISMA SERVICE INICIALIZADO (CONEXIÓN BAJO DEMANDA) ---');
    }

    async onModuleDestroy() {
        console.log('--- LIBERANDO CONEXIÓN ---');
        try {
            await this.$disconnect();
            console.log('✅ CONEXIÓN CERRADA');
        } catch (error) {
            // Silenciar error al cerrar
        }
    }
}
