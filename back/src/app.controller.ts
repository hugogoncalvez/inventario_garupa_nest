import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class AppController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getHello() {
        try {
            await this.prisma.$queryRawUnsafe('SELECT 1');
            return {
                status: 'ok',
                message: 'Server is awake and Database is CONNECTED! 🚀',
            };
        } catch (error) {
            console.error('Database connection test failed:', error);
            throw new HttpException({
                status: 'error',
                message: 'Database connection failed',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
