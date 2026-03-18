import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('tipos')
export class TiposController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.tipos.findMany();
    }

    @Post('create')
    create(@Body() body: any) {
        const { tipo } = body;
        return this.prisma.tipos.create({
            data: {
                tipo,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        const { tipo } = body;
        return this.prisma.tipos.update({
            where: { id: Number(id) },
            data: {
                tipo,
                updatedAt: new Date(),
            },
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prisma.tipos.delete({
            where: { id: Number(id) },
        });
    }
}

@Controller('estado')
export class EstadoController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.estados.findMany();
    }
}
