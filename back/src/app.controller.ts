import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async getStatus() {
        let databaseStatus = 'unknown';
        try {
            // Intenta una consulta simple para verificar la conexión
            await this.prisma.$queryRaw`SELECT 1`;
            databaseStatus = 'connected';
        } catch (error) {
            console.error('🚨 Error de conexión a la base de datos:', error.message);
            databaseStatus = 'disconnected';
        }

        return {
            status: 'ok',
            server: 'awake 🚀',
            database: databaseStatus,
            timestamp: new Date().toISOString()
        };
    }
}
