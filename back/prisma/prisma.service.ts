import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {

    async onModuleInit() {
        console.log('--- CONECTANDO A LA BASE DE DATOS ---');
        await this.$connect();
        console.log('✅ BASE DE DATOS CONECTADA');
    }

    async onModuleDestroy() {
        console.log('--- LIBERANDO CONEXIÓN ---');
        await this.$disconnect();
        console.log('✅ CONEXIÓN CERRADA');
    }
}