import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('ordenes')
export class OrdenesController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async findAll() {
        return this.prisma.ordendeservicios.findMany({ // Corregido segun schema.prisma (linea 130)
            orderBy: {
                id: 'desc'
            }
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.prisma.ordendeservicios.findUnique({
            where: { id: Number(id) }
        });
    }

    @Post()
    create(@Body() data: any) {
        const { id_equipo, problema_reportado, tecnico_asignado, trabajo_realizado, estado } = data;
        return this.prisma.ordendeservicios.create({
            data: {
                id_equipo: String(id_equipo), // Segun schema es VarChar(20)
                problema_reportado,
                tecnico_asignado,
                trabajo_realizado,
                estado,
                fecha_recepcion: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        const { problema_reportado, tecnico_asignado, trabajo_realizado, estado, fecha_entrega } = data;
        return this.prisma.ordendeservicios.update({
            where: { id: Number(id) },
            data: {
                problema_reportado,
                tecnico_asignado,
                trabajo_realizado,
                estado,
                fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
                updatedAt: new Date(),
            },
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prisma.ordendeservicios.delete({
            where: { id: Number(id) },
        });
    }
}
