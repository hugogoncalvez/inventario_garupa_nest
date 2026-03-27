import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('repuestos')
export class RepuestosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Query('tipo') tipoId?: string) {
    return this.prisma.repuestos.findMany({
      where: tipoId ? { tipo_id: parseInt(tipoId) } : {},
      include: {
        tipo_rel: true,
      },
      orderBy: {
        modelo: 'asc',
      },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.prisma.repuestos.findUnique({
      where: { id: parseInt(id) },
      include: {
        tipo_rel: true,
      },
    });
  }

  @Post()
  async create(@Body() data: any) {
    return this.prisma.repuestos.create({
      data: {
        modelo: data.modelo,
        marca: data.marca,
        descripcion: data.descripcion,
        stock_actual: parseInt(data.stock_actual) || 0,
        stock_minimo: parseInt(data.stock_minimo) || 0,
        tipo_rel: {
          connect: { id: parseInt(data.tipo_id) },
        },
      },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.repuestos.update({
      where: { id: parseInt(id) },
      data: {
        modelo: data.modelo,
        marca: data.marca,
        descripcion: data.descripcion,
        stock_actual: parseInt(data.stock_actual),
        stock_minimo: parseInt(data.stock_minimo),
        tipo_rel: {
          connect: { id: parseInt(data.tipo_id) },
        },
      },
    });
  }

  @Post('ajuste')
  async ajustarStock(@Body() data: { id: number; nueva_cantidad: number }) {
    return this.prisma.repuestos.update({
      where: { id: data.id },
      data: {
        stock_actual: data.nueva_cantidad,
      },
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prisma.repuestos.delete({
      where: { id: parseInt(id) },
    });
  }
}
