import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    
    private heartbeatInterval: NodeJS.Timeout;

    constructor() {
        // Cargar certificado SSL de Aiven si existe (ca.pem está en back/ca.pem)
        // Si vuelves a Clever Cloud y no necesitas SSL, esto se puede ignorar o comentar
        let sslConfig = null;
        try {
            const caPath = path.join(__dirname, '../../ca.pem');
            if (fs.existsSync(caPath)) {
                const sslCa = fs.readFileSync(caPath);
                sslConfig = { ca: sslCa };
            }
        } catch (e) {
            console.warn('No se pudo cargar el certificado SSL (ca.pem), continuando sin SSL...');
        }

        const adapter = new PrismaMariaDb({
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            // Bajamos a 2 para dejar margen a Antares y reinicios (Clever Cloud límite = 5)
            connectionLimit: 2, 
            connectTimeout: 20000,
            acquireTimeout: 20000,
            keepAliveDelay: 30000,
            ssl: sslConfig,
        });
        super({ adapter });
    }

    async onModuleInit() {
        console.log('CONECTANDO A BASE DE DATOS...');
        try {
            await this.$connect();
            console.log('¡CONEXIÓN EXITOSA CON LA BASE DE DATOS!');

            // Heartbeat: Ejecuta una consulta simple cada 30 minutos
            // Mantenemos la conexión "viva" pero con un intervalo razonable.
            this.heartbeatInterval = setInterval(async () => {
                try {
                    await this.$queryRawUnsafe('SELECT 1');
                    console.log('DB Heartbeat: Conexión activa ✅');
                } catch (err) {
                    console.error('DB Heartbeat Falló:', err.message);
                }
            }, 1000 * 60 * 30); // 30 minutos

        } catch (error) {
            console.error('ERROR AL CONECTAR A LA BASE DE DATOS:', error);
            throw error;
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



