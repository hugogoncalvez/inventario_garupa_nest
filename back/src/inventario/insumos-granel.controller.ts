import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('insumos-granel')
export class InsumosGranelController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.insumos_granel.findMany();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.prisma.insumos_granel.findUnique({
            where: { id: Number(id) },
        });
    }

    @Post()
    create(@Body() data: any) {
        const { nombre, sku, unidad_medida, stock_minimo } = data;
        return this.prisma.insumos_granel.create({
            data: {
                nombre,
                sku,
                unidad_medida,
                stock_minimo: Number(stock_minimo),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        const { nombre, sku, unidad_medida, stock_minimo } = data;
        return this.prisma.insumos_granel.update({
            where: { id: Number(id) },
            data: {
                nombre,
                sku,
                unidad_medida,
                stock_minimo: Number(stock_minimo),
                updatedAt: new Date(),
            },
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prisma.insumos_granel.delete({
            where: { id: Number(id) },
        });
    }

    @Post('movimientos/ajuste')
    async adjustStock(@Body() body: any) {
        const { insumo_granel_id, nueva_cantidad, usuario_id } = body;

        return this.prisma.$transaction(async (tx) => {
            // Registrar el movimiento
            await tx.movimientos_insumo_granel.create({
                data: {
                    insumo_granel_id: Number(insumo_granel_id),
                    cantidad_usada: Number(nueva_cantidad),
                    usuario_id: Number(usuario_id),
                    tipo_movimiento: 'AJUSTE',
                    fecha: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            // Actualizar el stock actual
            return tx.insumos_granel.update({
                where: { id: Number(insumo_granel_id) },
                data: {
                    stock_actual: Number(nueva_cantidad),
                    updatedAt: new Date(),
                }
            });
        });
    }

    @Post('movimientos/compra')
    async registerPurchase(@Body() body: any) {
        const { usuario_id, items } = body;

        return this.prisma.$transaction(async (tx) => {
            for (const item of items) {
                await tx.movimientos_insumo_granel.create({
                    data: {
                        insumo_granel_id: Number(item.insumo_granel_id),
                        cantidad_usada: Number(item.cantidad),
                        usuario_id: Number(usuario_id),
                        tipo_movimiento: 'COMPRA',
                        fecha: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                });

                await tx.insumos_granel.update({
                    where: { id: Number(item.insumo_granel_id) },
                    data: {
                        stock_actual: { increment: Number(item.cantidad) },
                        updatedAt: new Date(),
                    }
                });
            }
            return { success: true };
        });
    }
}
