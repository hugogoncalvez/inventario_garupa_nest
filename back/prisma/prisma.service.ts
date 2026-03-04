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
        await this.$connect();
    }
}



