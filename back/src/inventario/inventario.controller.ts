import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('inventario')
export class InventarioController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.inventarios.findMany({
            orderBy: { id: 'desc' }
        });
    }

    @Get('next')
    async getNextInvNumber() {
        const lastItem = await this.prisma.inventarios.findFirst({
            orderBy: { id: 'desc' },
            select: { num_inventario: true }
        });

        if (!lastItem || !lastItem.num_inventario) return { nextInvNumber: '1' };

        // Intenta incrementar el último número si es numérico
        const lastNum = parseInt(lastItem.num_inventario);
        return { nextInvNumber: isNaN(lastNum) ? lastItem.num_inventario + '_1' : (lastNum + 1).toString() };
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.prisma.inventarios.findUnique({
            where: { id: Number(id) },
        });
    }

    @Post('create')
    create(@Body() data: any) {
        return this.prisma.inventarios.create({
            data,
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.prisma.inventarios.update({
            where: { id: Number(id) },
            data,
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prisma.inventarios.delete({
            where: { id: Number(id) },
        });
    }
}
