import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    
    private heartbeatInterval: NodeJS.Timeout;

    constructor() {
        // En Prisma 7 debemos pasar la URL explícitamente al constructor
        // si no la definimos en el esquema ni usamos adaptadores manuales.
        super({
            datasource: {
                url: process.env.DATABASE_URL
            },
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        console.log('CONECTANDO A BASE DE DATOS (Prisma 7)...');
        try {
            await this.$connect();
            console.log('¡CONEXIÓN EXITOSA CON LA BASE DE DATOS!');

            // Heartbeat cada 30 min
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
