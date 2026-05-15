import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pedidos_estado, movimientos_tinta_tipo_movimiento } from '@prisma/client';

@Controller('pedidos')
export class PedidosController {
    constructor(private readonly prisma: PrismaService) { }

    // Crear un nuevo pedido
    @Post()
    async createPedido(@Body() body: any) {
        const { usuario_id, observaciones, items } = body;

        return this.prisma.pedidos.create({
            data: {
                usuario_id: Number(usuario_id),
                observaciones,
                estado: 'PENDIENTE',
                items: {
                    create: items.map((item: any) => ({
                        cartucho_id: Number(item.cartucho_id),
                        cantidad_pedida: Number(item.cantidad_pedida),
                    })),
                },
            },
            include: { items: true },
        });
    }

    // Listar todos los pedidos con sus items y el modelo del cartucho
    @Get()
    async getPedidos(@Query('estado') estado?: string) {
        return this.prisma.pedidos.findMany({
            where: estado ? { estado: estado as any } : {},
            include: {
                items: {
                    include: {
                        cartuchos: true
                    }
                },
                usuarios: true
            },
            orderBy: { fecha: 'desc' }
        });
    }

    // Obtener un pedido específico
    @Get(':id')
    async getPedido(@Param('id') id: string) {
        return this.prisma.pedidos.findUnique({
            where: { id: Number(id) },
            include: {
                items: {
                    include: {
                        cartuchos: true
                    }
                },
                usuarios: true
            }
        });
    }

    // Recibir un pedido (Actualizar cantidades recibidas y mover a stock real)
    @Post(':id/recibir')
    async recibirPedido(@Param('id') id: string, @Body() body: any) {
        const { items_recibidos, usuario_id } = body; 

        const pedidoId = Number(id);
        const userId = Number(usuario_id);

        console.log(`📦 Intentando recibir pedido ID: ${pedidoId}`);
        console.log(`👤 Usuario solicitante ID: ${userId}`);

        if (isNaN(pedidoId)) {
            console.error('❌ ID de pedido no válido');
            throw new Error('ID de pedido no válido');
        }

        if (!items_recibidos || !Array.isArray(items_recibidos) || items_recibidos.length === 0) {
            console.error('❌ No se enviaron items para recibir');
            throw new Error('No se enviaron items para recibir');
        }

        try {
            return await this.prisma.$transaction(async (tx) => {
                for (const rec of items_recibidos) {
                    const itemId = Number(rec.item_id);
                    const cantidad = Number(rec.cantidad);

                    if (isNaN(itemId) || isNaN(cantidad) || cantidad <= 0) {
                        console.warn(`⚠️ Item o cantidad no válida ignorada: item_id=${rec.item_id}, cantidad=${rec.cantidad}`);
                        continue;
                    }

                    console.log(`🔄 Procesando recepción: ItemPedido ${itemId} -> Cantidad: ${cantidad}`);
                    
                    // 1. Actualizar el ítem del pedido
                    const itemPedido = await tx.pedidos_items.update({
                        where: { id: itemId },
                        data: {
                            cantidad_recibida: { increment: cantidad },
                        },
                    });

                    // 2. Registrar el movimiento de COMPRA real
                    await tx.movimientos_tinta.create({
                        data: {
                            cartucho_id: itemPedido.cartucho_id,
                            cantidad: cantidad,
                            usuario_id: isNaN(userId) ? null : userId,
                            tipo_movimiento: movimientos_tinta_tipo_movimiento.COMPRA,
                            fecha: new Date(),
                        }
                    });

                    // 3. Incrementar el stock del cartucho
                    await tx.cartuchos.update({
                        where: { id: itemPedido.cartucho_id },
                        data: {
                            stock_unidades: { increment: cantidad },
                            updatedAt: new Date(),
                        }
                    });
                }

                // 4. Verificar si el pedido está completo para cambiar el estado
                const allItems = await tx.pedidos_items.findMany({
                    where: { pedido_id: pedidoId }
                });

                if (allItems.length === 0) {
                    console.warn(`⚠️ No se encontraron items para el pedido ${pedidoId}`);
                }

                const isComplete = allItems.every(i => i.cantidad_recibida >= i.cantidad_pedida);
                const isPartial = allItems.some(i => i.cantidad_recibida > 0);

                let nuevoEstado: pedidos_estado = 'PENDIENTE';
                if (isComplete) nuevoEstado = 'RECIBIDO';
                else if (isPartial) nuevoEstado = 'PARCIAL';

                console.log(`✅ Actualizando pedido ${pedidoId} a estado: ${nuevoEstado}`);

                return await tx.pedidos.update({
                    where: { id: pedidoId },
                    data: { estado: nuevoEstado }
                });
            }, { timeout: 30000 }); // Aumentamos el timeout a 30 segundos

        } catch (error) {
            console.error('🚨 ERROR CRÍTICO EN recibirPedido:', error);
            // Si el error es de Prisma (P2025), significa que no encontró el registro
            if (error.code === 'P2025') {
                throw new Error('No se encontró uno de los registros (Pedido o Item)');
            }
            throw error;
        }
    }

    @Put(':id/cancelar')
    async cancelarPedido(@Param('id') id: string) {
        return this.prisma.pedidos.update({
            where: { id: Number(id) },
            data: { estado: 'CANCELADO' }
        });
    }
}
