import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit {
    constructor() {
        // Cargar certificado SSL de Aiven (ca.pem está en back/ca.pem)
        const sslCa = fs.readFileSync(path.join(__dirname, '../../ca.pem'));

        const adapter = new PrismaMariaDb({
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            connectionLimit: 3,
            connectTimeout: 20000,
            acquireTimeout: 20000,
            keepAliveDelay: 30000,
            ssl: {
                ca: sslCa,
            },
        });
        super({ adapter });
    }

    async onModuleInit() {
        console.log('CONECTANDO A BASE DE DATOS AIVEN...');
        try {
            await this.$connect();
            console.log('¡CONEXIÓN EXITOSA CON LA BASE DE DATOS!');
        } catch (error) {
            console.error('ERROR AL CONECTAR A LA BASE DE DATOS:', error);
            throw error;
        }
    }
}



