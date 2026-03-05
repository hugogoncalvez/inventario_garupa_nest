import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit {
    constructor() {
        const adapter = new PrismaMariaDb({
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            connectionLimit: 10,
        });
        super({ adapter });
    }

    async onModuleInit() {
        console.log('CONECTANDO A BASE DE DATOS CLEVER CLOUD...');
        try {
            await this.$connect();
            console.log('¡CONEXIÓN EXITOSA CON LA BASE DE DATOS!');
        } catch (error) {
            console.error('ERROR AL CONECTAR A LA BASE DE DATOS:', error);
            throw error;
        }
    }
}



