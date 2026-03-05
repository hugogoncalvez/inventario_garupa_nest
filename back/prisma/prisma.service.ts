import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit {
    constructor() {
        super({
            adapter: new PrismaMariaDb({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                connectionLimit: 10,
            }),
        });
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



