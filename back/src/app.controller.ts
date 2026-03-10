import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    getStatus() {
        // Respuesta estática para que Render no sature la base de datos
        return {
            status: 'ok',
            server: 'awake 🚀',
            info: 'Visit /health to check database'
        };
    }

    @Get('health')
    async getHealth() {
        let databaseStatus = 'unknown';
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            databaseStatus = 'connected';
        } catch (error) {
            databaseStatus = 'disconnected';
        }

        return {
            database: databaseStatus,
            timestamp: new Date().toISOString()
        };
    }
}
