import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('areas')
export class AreasController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.areas.findMany();
    }

    @Post('create')
    create(@Body() body: any) {
        const { area, responsable } = body;
        return this.prisma.areas.create({
            data: {
                area,
                responsable,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        const { area, responsable } = body;
        return this.prisma.areas.update({
            where: { id: Number(id) },
            data: {
                area,
                responsable,
                updatedAt: new Date(),
            },
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prisma.areas.delete({
            where: { id: Number(id) },
        });
    }
}
