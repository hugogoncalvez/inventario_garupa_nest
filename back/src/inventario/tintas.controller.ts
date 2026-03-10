import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { movimientos_tinta_tipo_movimiento } from '@prisma/client';

@Controller('tintas')
export class TintasController {
    constructor(private readonly prisma: PrismaService) { }

    // --- Cartuchos ---
    @Get('cartuchos')
    async getCartuchos() {
        return this.prisma.cartuchos.findMany({
            include: {
                insumos_granel: true,
            },
            orderBy: { modelo: 'asc' },
        });
    }

    @Get('cartuchos/:id')
    async getCartucho(@Param('id') id: string) {
        return this.prisma.cartuchos.findUnique({
            where: { id: Number(id) },
            include: {
                insumos_granel: true,
            },
        });
    }

    @Post('cartuchos')
    async createCartucho(@Body() body: any) {
        const { insumo_granel_id, ...data } = body;
        return this.prisma.cartuchos.create({
            data: {
                ...data,
                insumo_granel_id: insumo_granel_id ? Number(insumo_granel_id) : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put('cartuchos/:id')
    async updateCartucho(@Param('id') id: string, @Body() body: any) {
        const { insumo_granel_id, ...data } = body;
        return this.prisma.cartuchos.update({
            where: { id: Number(id) },
            data: {
                ...data,
                insumo_granel_id: insumo_granel_id ? Number(insumo_granel_id) : null,
                updatedAt: new Date(),
            },
        });
    }

    @Delete('cartuchos/:id')
    async deleteCartucho(@Param('id') id: string) {
        return this.prisma.cartuchos.delete({
            where: { id: Number(id) },
        });
    }

    // --- Impresoras ---
    @Get('impresoras')
    async getImpresoras() {
        return this.prisma.impresoras.findMany({
            include: {
                areas: true,
            },
            orderBy: { modelo: 'asc' },
        });
    }

    @Get('impresoras/:id')
    async getImpresora(@Param('id') id: string) {
        return this.prisma.impresoras.findUnique({
            where: { id: Number(id) },
            include: {
                areas: true,
            },
        });
    }

    @Post('impresoras')
    async createImpresora(@Body() body: any) {
        const { area_id, ...data } = body;
        return this.prisma.impresoras.create({
            data: {
                ...data,
                area_id: area_id ? Number(area_id) : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put('impresoras/:id')
    async updateImpresora(@Param('id') id: string, @Body() body: any) {
        const { area_id, ...data } = body;
        return this.prisma.impresoras.update({
            where: { id: Number(id) },
            data: {
                ...data,
                area_id: area_id ? Number(area_id) : null,
                updatedAt: new Date(),
            },
        });
    }

    @Delete('impresoras/:id')
    async deleteImpresora(@Param('id') id: string) {
        return this.prisma.impresoras.delete({
            where: { id: Number(id) },
        });
    }

    // --- Movimientos / Ajustes ---
    @Post('movimientos/ajuste')
    async adjustStock(@Body() body: any) {
        const { cartucho_id, nueva_cantidad, usuario_id } = body;

        return this.prisma.$transaction(async (tx) => {
            // Registrar el movimiento
            await tx.movimientos_tinta.create({
                data: {
                    cartucho_id: Number(cartucho_id),
                    cantidad: 0, // Campo requerido segun schema (linea 117)
                    usuario_id: Number(usuario_id),
                    tipo_movimiento: movimientos_tinta_tipo_movimiento.AJUSTE_DE_INVENTARIO, 
                    fecha: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            // Actualizar el stock actual de unidades
            return tx.cartuchos.update({
                where: { id: Number(cartucho_id) },
                data: {
                    stock_unidades: Number(nueva_cantidad),
                    updatedAt: new Date(),
                }
            });
        });
    }

    @Post('movimientos/compra')
    async registerPurchase(@Body() body: any) {
        const { cartucho_id, cantidad, usuario_id } = body;

        return this.prisma.$transaction(async (tx) => {
            await tx.movimientos_tinta.create({
                data: {
                    cartucho_id: Number(cartucho_id),
                    cantidad: Number(cantidad),
                    usuario_id: Number(usuario_id),
                    tipo_movimiento: movimientos_tinta_tipo_movimiento.COMPRA,
                    fecha: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            return tx.cartuchos.update({
                where: { id: Number(cartucho_id) },
                data: {
                    stock_unidades: { increment: Number(cantidad) },
                    updatedAt: new Date(),
                }
            });
        });
    }

    @Post('movimientos/entrega')
    async registerEntrega(@Body() body: any) {
        const { usuario_id, items } = body;

        return this.prisma.$transaction(async (tx) => {
            for (const item of items) {
                await tx.movimientos_tinta.create({
                    data: {
                        cartucho_id: Number(item.cartucho_id),
                        impresora_id: Number(item.impresora_id),
                        cantidad: Number(item.cantidad),
                        usuario_id: Number(usuario_id),
                        tipo_movimiento: movimientos_tinta_tipo_movimiento.ENTREGA_A__REA,
                        fecha: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                });

                await tx.cartuchos.update({
                    where: { id: Number(item.cartucho_id) },
                    data: {
                        stock_unidades: { decrement: Number(item.cantidad) },
                        updatedAt: new Date(),
                    }
                });
            }
            return { success: true };
        });
    }

    @Get('movimientos/historial/:id')
    async getHistorial(@Param('id') id: string) {
        return this.prisma.movimientos_tinta.findMany({
            where: { cartucho_id: Number(id) },
            include: {
                impresoras: {
                    include: { areas: true },
                },
                usuarios: true,
            },
            orderBy: { fecha: 'desc' },
        });
    }
}
