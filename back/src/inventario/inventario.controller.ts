import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('inventario')
export class InventarioController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.inventarios.findMany();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.prisma.inventarios.findUnique({
            where: { id: Number(id) },
        });
    }

    @Post()
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
