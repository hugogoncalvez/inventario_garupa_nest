import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    
    private heartbeatInterval: NodeJS.Timeout;

    constructor() {
        // Dejamos que Prisma use la DATABASE_URL del .env directamente
        // Esto es mucho más estable para Clever Cloud y Render.
        super({
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        console.log('CONECTANDO A BASE DE DATOS (Modo Nativo)...');
        try {
            await this.$connect();
            console.log('¡CONEXIÓN EXITOSA CON LA BASE DE DATOS!');

            // Heartbeat cada 30 min para mantener la conexión viva en Render/CleverCloud
            this.heartbeatInterval = setInterval(async () => {
                try {
                    await this.$queryRawUnsafe('SELECT 1');
                    console.log('DB Heartbeat: Conexión activa ✅');
                } catch (err) {
                    console.error('DB Heartbeat Falló:', err.message);
                }
            }, 1000 * 60 * 30);

        } catch (error) {
            console.error('ERROR AL CONECTAR A LA BASE DE DATOS:', error);
            // No lanzamos el error aquí para que la app no explote si la DB tarda en despertar
        }
    }

    async onModuleDestroy() {
        console.log('CERRANDO CONEXIONES A BASE DE DATOS...');
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        await this.$disconnect();
        console.log('¡CONEXIONES CERRADAS CORRECTAMENTE!');
    }
}
