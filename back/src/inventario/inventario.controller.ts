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

        const lastValue = lastItem.num_inventario;
        // Busca una parte no numérica al inicio y una numérica al final
        const match = lastValue.match(/^(.*?)(\d+)$/);

        if (match) {
            const prefix = match[1];
            const numberStr = match[2];
            const nextNumber = (parseInt(numberStr, 10) + 1).toString();
            
            // Mantiene el padding de ceros si existía (ej: I001 -> I002)
            const paddedNumber = nextNumber.padStart(numberStr.length, '0');
            
            return { nextInvNumber: `${prefix}${paddedNumber}` };
        }

        // Si no sigue el patrón estándar, añade el sufijo
        return { nextInvNumber: lastValue + '_1' };
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.prisma.inventarios.findUnique({
            where: { id: Number(id) },
        });
    }

    @Post('create')
    create(@Body() body: any) {
        const { num_inventario, num_pc, tipo, descripcion, marca, num_serie, observaciones, area, usuario, resp_area, estado } = body;
        return this.prisma.inventarios.create({
            data: {
                num_inventario,
                num_pc,
                tipo,
                descripcion,
                marca,
                num_serie,
                observaciones,
                area,
                usuario,
                resp_area,
                estado,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        const { num_inventario, num_pc, tipo, descripcion, marca, num_serie, observaciones, area, usuario, resp_area, estado } = body;
        return this.prisma.inventarios.update({
            where: { id: Number(id) },
            data: {
                num_inventario,
                num_pc,
                tipo,
                descripcion,
                marca,
                num_serie,
                observaciones,
                area,
                usuario,
                resp_area,
                estado,
                updatedAt: new Date(),
            },
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prisma.inventarios.delete({
            where: { id: Number(id) },
        });
    }
}
