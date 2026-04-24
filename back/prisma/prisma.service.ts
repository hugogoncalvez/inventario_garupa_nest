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
        console.log('--- INICIANDO CONEXIÓN A BASE DE DATOS ---');
        let retries = 5;
        while (retries > 0) {
            try {
                await this.$connect();
                console.log('✅ BASE DE DATOS CONECTADA EXITOSAMENTE');
                break;
            } catch (err) {
                retries--;
                console.error(`❌ Error al conectar a la DB. Reintentos restantes: ${retries}`);
                console.error(`Motivo: ${err.message}`);
                if (retries === 0) throw err;
                // Esperar 2 segundos antes de reintentar
                await new Promise(res => setTimeout(res, 2000));
            }
        }
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
