import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    
    private heartbeatInterval: NodeJS.Timeout;

    // Eliminamos el constructor para que Prisma 7 use la configuración por defecto
    // que toma automáticamente de la variable de entorno DATABASE_URL.

    async onModuleInit() {
        console.log('CONECTANDO A BASE DE DATOS (Prisma 7)...');
        try {
            await this.$connect();
            console.log('¡CONEXIÓN EXITOSA CON LA BASE DE DATOS!');

            // Heartbeat cada 30 min para evitar desconexiones por inactividad
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
