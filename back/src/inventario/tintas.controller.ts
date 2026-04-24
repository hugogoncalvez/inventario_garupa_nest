import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { movimientos_tinta_tipo_movimiento } from '@prisma/client';
import { WhatsAppService } from './whatsapp.service';

@Controller('tintas')
export class TintasController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly whatsappService: WhatsAppService
    ) { }

    // --- Cartuchos ---
    @Get('cartuchos')
    async getCartuchos() {
        const cartuchos = await this.prisma.cartuchos.findMany({
            include: {
                insumos_granel: true,
                movimientos_tinta: {
                    include: {
                        impresoras: {
                            include: {
                                areas: true
                            }
                        }
                    }
                }
            },
            orderBy: { modelo: 'asc' },
        });

        return cartuchos.map(c => {
            const areasSet = new Set<string>();
            const impresorasSet = new Set<number>();
            
            c.movimientos_tinta.forEach(m => {
                // Filtramos por entregas
                if (m.tipo_movimiento === 'ENTREGA_A__REA' || m.tipo_movimiento as any === 'ENTREGA A ÁREA') {
                    const areaNombre = m.impresoras?.areas?.area;
                    if (areaNombre) areasSet.add(areaNombre);
                    if (m.impresora_id) impresorasSet.add(m.impresora_id);
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { movimientos_tinta, ...data } = c;
            return {
                ...data,
                areas_uso: Array.from(areasSet),
                impresoras_vinculadas: Array.from(impresorasSet)
            };
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
        const { modelo, sku, color, tipo, es_recargable, insumo_granel_id, stock_unidades, stock_minimo_unidades } = body;
        return this.prisma.cartuchos.create({
            data: {
                modelo,
                sku: sku?.trim() === '' ? null : sku,
                color,
                tipo,
                es_recargable: !!es_recargable,
                insumo_granel_id: insumo_granel_id ? Number(insumo_granel_id) : null,
                stock_unidades: Number(stock_unidades || 0),
                stock_minimo_unidades: Number(stock_minimo_unidades || 0),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put('cartuchos/:id')
    async updateCartucho(@Param('id') id: string, @Body() body: any) {
        const { modelo, sku, color, tipo, es_recargable, insumo_granel_id, stock_unidades, stock_minimo_unidades } = body;
        
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (modelo !== undefined) updateData.modelo = modelo;
        if (sku !== undefined) updateData.sku = sku?.trim() === '' ? null : sku;
        if (color !== undefined) updateData.color = color;
        if (tipo !== undefined) updateData.tipo = tipo;
        if (es_recargable !== undefined) updateData.es_recargable = !!es_recargable;
        
        if (insumo_granel_id !== undefined) {
            updateData.insumo_granel_id = insumo_granel_id ? Number(insumo_granel_id) : null;
        }

        if (stock_unidades !== undefined) {
            updateData.stock_unidades = Number(stock_unidades);
        }

        if (stock_minimo_unidades !== undefined) {
            updateData.stock_minimo_unidades = Number(stock_minimo_unidades);
        }

        return this.prisma.cartuchos.update({
            where: { id: Number(id) },
            data: updateData,
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
        const { modelo, marca, area_id } = body;
        return this.prisma.impresoras.create({
            data: {
                modelo,
                marca,
                area_id: area_id ? Number(area_id) : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    @Put('impresoras/:id')
    async updateImpresora(@Param('id') id: string, @Body() body: any) {
        const { modelo, marca, area_id } = body;
        return this.prisma.impresoras.update({
            where: { id: Number(id) },
            data: {
                modelo,
                marca,
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
        const { usuario_id, items } = body;

        // Validación anti-duplicados: Buscar si ya existe un movimiento idéntico en los últimos 5 segundos
        const fiveSecondsAgo = new Date(Date.now() - 5000);
        
        if (items.length > 0) {
            const duplicate = await this.prisma.movimientos_tinta.findFirst({
                where: {
                    usuario_id: Number(usuario_id),
                    cartucho_id: Number(items[0].cartucho_id),
                    cantidad: Number(items[0].cantidad),
                    tipo_movimiento: movimientos_tinta_tipo_movimiento.COMPRA,
                    createdAt: { gte: fiveSecondsAgo }
                }
            });

            if (duplicate) {
                return { success: true, message: 'Registro de compra duplicado detectado y omitido.' };
            }
        }

        return this.prisma.$transaction(async (tx) => {
            for (const item of items) {
                await tx.movimientos_tinta.create({
                    data: {
                        cartucho_id: Number(item.cartucho_id),
                        cantidad: Number(item.cantidad),
                        usuario_id: Number(usuario_id),
                        tipo_movimiento: movimientos_tinta_tipo_movimiento.COMPRA,
                        fecha: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                });

                await tx.cartuchos.update({
                    where: { id: Number(item.cartucho_id) },
                    data: {
                        stock_unidades: { increment: Number(item.cantidad) },
                        updatedAt: new Date(),
                    }
                });
            }
            return { success: true };
        });
    }

    @Post('movimientos/entrega')
    async registerEntrega(@Body() body: any) {
        const { usuario_id, items } = body;

        // Validación anti-duplicados: Buscar si ya existe un movimiento idéntico en los últimos 5 segundos
        const fiveSecondsAgo = new Date(Date.now() - 5000);
        
        // Verificamos el primer item (usualmente suficiente para detectar el doble clic de una lista)
        if (items.length > 0) {
            const duplicate = await this.prisma.movimientos_tinta.findFirst({
                where: {
                    usuario_id: Number(usuario_id),
                    cartucho_id: Number(items[0].cartucho_id),
                    impresora_id: Number(items[0].impresora_id),
                    cantidad: Number(items[0].cantidad),
                    tipo_movimiento: movimientos_tinta_tipo_movimiento.ENTREGA_A__REA,
                    createdAt: { gte: fiveSecondsAgo }
                }
            });

            if (duplicate) {
                return { success: true, message: 'Registro duplicado detectado y omitido.' };
            }
        }

        const results = await this.prisma.$transaction(async (tx) => {
            const updatedItems: any[] = [];
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

                const updated = await tx.cartuchos.update({
                    where: { id: Number(item.cartucho_id) },
                    data: {
                        stock_unidades: { decrement: Number(item.cantidad) },
                        updatedAt: new Date(),
                    }
                });
                updatedItems.push(updated);
            }
            return updatedItems;
        });

        // Alerta de stock bajo
        for (const cartucho of results) {
            if (cartucho.stock_unidades <= cartucho.stock_minimo_unidades) {
                this.whatsappService.sendStockAlert({
                    modelo: cartucho.modelo,
                    color: cartucho.color,
                    stock: cartucho.stock_unidades,
                    min: cartucho.stock_minimo_unidades
                });
            }
        }

        return { success: true };
    }

    @Post('movimientos/recarga')
    async registerRecarga(@Body() body: any) {
        const {
            insumo_granel_id,
            unidad_cartucho_id,
            impresora_id,
            cantidad_cartuchos,
            cantidad_insumo,
            usuario_id
        } = body;

        const results = await this.prisma.$transaction(async (tx) => {
            // 1. Registrar el movimiento de insumo a granel
            await tx.movimientos_insumo_granel.create({
                data: {
                    insumo_granel_id: Number(insumo_granel_id),
                    unidad_cartucho_id: unidad_cartucho_id ? Number(unidad_cartucho_id) : null,
                    impresora_id: impresora_id ? Number(impresora_id) : null,
                    cantidad_usada: Number(cantidad_insumo),
                    cantidad_cartuchos_recargados: Number(cantidad_cartuchos),
                    usuario_id: Number(usuario_id),
                    tipo_movimiento: 'RECARGA',
                    fecha: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            // 2. Decrementar el stock del insumo a granel
            return tx.insumos_granel.update({
                where: { id: Number(insumo_granel_id) },
                data: {
                    stock_actual: { decrement: Number(cantidad_insumo) },
                    updatedAt: new Date(),
                }
            });
        });

        // 3. Alerta de stock bajo para el insumo a granel
        if (Number(results.stock_actual) <= Number(results.stock_minimo)) {
            this.whatsappService.sendStockAlert({
                modelo: results.nombre,
                color: 'N/A',
                stock: Number(results.stock_actual),
                min: Number(results.stock_minimo)
            });
        }

        return { success: true };
    }

    @Post('whatsapp/resumen-stock')
    async sendStockSummary() {
        const [cartuchos, granel] = await Promise.all([
            this.prisma.cartuchos.findMany({ orderBy: { modelo: 'asc' } }),
            this.prisma.insumos_granel.findMany({ orderBy: { nombre: 'asc' } })
        ]);

        let message = `📊 *RESUMEN DE STOCK IT* 📊\n\n`;

        message += `🖨️ *Cartuchos y Tóner:*\n`;
        cartuchos.forEach(c => {
            const alerta = c.stock_unidades <= c.stock_minimo_unidades ? '🛑' : '✅';
            message += `${alerta} *${c.modelo}* (${c.color}): ${c.stock_unidades} un.\n`;
        });

        message += `\n🧪 *Insumos a Granel:*\n`;
        granel.forEach(g => {
            const alerta = Number(g.stock_actual) <= Number(g.stock_minimo) ? '🛑' : '✅';
            message += `${alerta} *${g.nombre}*: ${Number(g.stock_actual)} ${g.unidad_medida}\n`;
        });

        message += `\n_Generado el: ${new Date().toLocaleString()}_`;

        await this.whatsappService.sendMessage(message);
        return { success: true };
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
