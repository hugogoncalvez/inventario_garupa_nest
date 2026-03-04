import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { movimientos_tinta_tipo_movimiento } from '@prisma/client';

@Controller('tintas')
export class TintasController {
    constructor(private readonly prisma: PrismaService) { }

    // --- Cartuchos ---
    @Get('cartuchos')
    async findAllCartuchos(@Query('includeInsumoGranel') includeInsumoGranel?: string) {
        return this.prisma.cartuchos.findMany({
            include: {
                insumos_granel: includeInsumoGranel === 'true',
            },
        });
    }

    @Get('cartuchos/:id')
    findOneCartucho(@Param('id') id: string) {
        return this.prisma.cartuchos.findUnique({
            where: { id: Number(id) },
            include: { insumos_granel: true }
        });
    }

    @Post('cartuchos')
    createCartucho(@Body() data: any) {
        const { modelo, sku, color, tipo, es_recargable, stock_minimo_unidades, insumo_granel_id } = data;
        return this.prisma.cartuchos.create({
            data: {
                modelo,
                sku,
                color,
                tipo, // Enum cartuchos_tipo
                es_recargable: Boolean(es_recargable),
                stock_minimo_unidades: Number(stock_minimo_unidades),
                insumo_granel_id: insumo_granel_id ? Number(insumo_granel_id) : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put('cartuchos/:id')
    updateCartucho(@Param('id') id: string, @Body() data: any) {
        const { modelo, sku, color, tipo, es_recargable, stock_minimo_unidades, insumo_granel_id } = data;
        return this.prisma.cartuchos.update({
            where: { id: Number(id) },
            data: {
                modelo,
                sku,
                color,
                tipo,
                es_recargable: Boolean(es_recargable),
                stock_minimo_unidades: Number(stock_minimo_unidades),
                insumo_granel_id: insumo_granel_id ? Number(insumo_granel_id) : null,
                updatedAt: new Date(),
            },
        });
    }

    @Delete('cartuchos/:id')
    removeCartucho(@Param('id') id: string) {
        return this.prisma.cartuchos.delete({
            where: { id: Number(id) },
        });
    }

    // --- Impresoras ---
    @Get('impresoras')
    async findAllImpresoras() {
        return this.prisma.impresoras.findMany({
            include: {
                areas: true // Corregido segun schema.prisma (linea 51)
            }
        });
    }

    @Post('impresoras')
    createImpresora(@Body() data: any) {
        const { modelo, marca, area_id } = data;
        return this.prisma.impresoras.create({
            data: {
                modelo,
                marca,
                area_id: area_id ? Number(area_id) : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
    }

    @Put('impresoras/:id')
    updateImpresora(@Param('id') id: string, @Body() data: any) {
        const { modelo, marca, area_id } = data;
        return this.prisma.impresoras.update({
            where: { id: Number(id) },
            data: {
                modelo,
                marca,
                area_id: area_id ? Number(area_id) : null,
                updatedAt: new Date(),
            }
        });
    }

    @Delete('impresoras/:id')
    removeImpresora(@Param('id') id: string) {
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
                    tipo_movimiento: 'AJUSTE_DE_INVENTARIO', // Usar la llave del Enum para TypeScript
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
                    tipo_movimiento: 'COMPRA',
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
                        tipo_movimiento: 'ENTREGA_A__REA', // Usar la llave del Enum para TypeScript
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

    @Post('movimientos/recarga')
    async registerRecarga(@Body() body: any) {
        const { insumo_granel_id, unidad_cartucho_id, impresora_id, cantidad_cartuchos, cantidad_insumo, usuario_id } = body;

        return this.prisma.$transaction(async (tx) => {
            // 1. Registrar el uso de insumo a granel
            await tx.movimientos_insumo_granel.create({
                data: {
                    insumo_granel_id: Number(insumo_granel_id),
                    unidad_cartucho_id: Number(unidad_cartucho_id),
                    impresora_id: Number(impresora_id),
                    cantidad_usada: Number(cantidad_insumo),
                    cantidad_cartuchos_recargados: Number(cantidad_cartuchos),
                    usuario_id: Number(usuario_id),
                    tipo_movimiento: 'RECARGA',
                    fecha: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            // 2. Descontar stock del insumo a granel
            await tx.insumos_granel.update({
                where: { id: Number(insumo_granel_id) },
                data: {
                    stock_actual: { decrement: Number(cantidad_insumo) },
                    updatedAt: new Date(),
                }
            });

            // 3. Incrementar el stock del cartucho recargado
            return tx.cartuchos.update({
                where: { id: Number(unidad_cartucho_id) },
                data: {
                    stock_unidades: { increment: Number(cantidad_cartuchos) },
                    updatedAt: new Date(),
                }
            });
        });
    }

}
