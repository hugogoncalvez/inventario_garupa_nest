import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pedidos_estado, movimientos_tinta_tipo_movimiento } from '@prisma/client';
import { WhatsAppService } from './whatsapp.service';

@Controller('pedidos')
export class PedidosController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly whatsappService: WhatsAppService
    ) { }

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
            const result = await this.prisma.$transaction(async (tx) => {
                const itemsProcesados: any[] = [];
                const restablecidos: any[] = [];

                for (const rec of items_recibidos) {
                    const itemId = Number(rec.item_id);
                    const cantidad = Number(rec.cantidad);

                    if (isNaN(itemId) || isNaN(cantidad) || cantidad <= 0) {
                        console.warn(`⚠️ Item o cantidad no válida ignorada: item_id=${rec.item_id}, cantidad=${rec.cantidad}`);
                        continue;
                    }

                    console.log(`🔄 Procesando recepción: ItemPedido ${itemId} -> Cantidad: ${cantidad}`);
                    
                    // 1. Obtener item original y cartucho actual
                    const itemOriginal = await tx.pedidos_items.findUnique({
                        where: { id: itemId },
                        include: { cartuchos: true }
                    });

                    if (!itemOriginal) continue;

                    const cartucho = itemOriginal.cartuchos;
                    const stockAnterior = cartucho.stock_unidades;
                    const stockMinimo = cartucho.stock_minimo_unidades;

                    // 2. Actualizar el ítem del pedido
                    await tx.pedidos_items.update({
                        where: { id: itemId },
                        data: {
                            cantidad_recibida: { increment: cantidad },
                        },
                    });

                    // 3. Registrar el movimiento de COMPRA real
                    await tx.movimientos_tinta.create({
                        data: {
                            cartucho_id: cartucho.id,
                            cantidad: cantidad,
                            usuario_id: isNaN(userId) ? null : userId,
                            tipo_movimiento: movimientos_tinta_tipo_movimiento.COMPRA,
                            fecha: new Date(),
                        }
                    });

                    // 4. Incrementar el stock del cartucho
                    const cartuchoActualizado = await tx.cartuchos.update({
                        where: { id: cartucho.id },
                        data: {
                            stock_unidades: { increment: cantidad },
                            updatedAt: new Date(),
                        }
                    });

                    const stockNuevo = cartuchoActualizado.stock_unidades;

                    itemsProcesados.push({
                        modelo: cartucho.modelo,
                        color: cartucho.color,
                        cantidadRecibida: cantidad
                    });

                    // Verificar si restableció stock (pasó de estar por debajo o igual al mínimo a superar el mínimo)
                    if (stockAnterior <= stockMinimo && stockNuevo > stockMinimo) {
                        restablecidos.push({
                            modelo: cartucho.modelo,
                            color: cartucho.color,
                            stockAnterior,
                            stockNuevo,
                            minimo: stockMinimo
                        });
                    }
                }

                // 5. Verificar si el pedido está completo para cambiar el estado
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

                const pedidoActualizado = await tx.pedidos.update({
                    where: { id: pedidoId },
                    data: { estado: nuevoEstado }
                });

                return {
                    pedido: pedidoActualizado,
                    nuevoEstado,
                    itemsProcesados,
                    restablecidos
                };
            }, { timeout: 30000 }); // Aumentamos el timeout a 30 segundos

            // Notificación por WhatsApp en segundo plano
            try {
                const usuario = isNaN(userId) ? null : await this.prisma.usuarios.findUnique({ where: { id: userId } });
                const usuarioNombre = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Sistema';

                let msg = `📦 *RECEPCIÓN DE PEDIDO #${pedidoId}*\n`;
                msg += `📊 *Estado del pedido:* ${result.nuevoEstado}\n`;
                if (usuarioNombre) msg += `👤 *Procesado por:* ${usuarioNombre}\n\n`;
                msg += `📥 *Insumos Recibidos e Ingresados:*\n`;

                result.itemsProcesados.forEach(item => {
                    msg += `• *+${item.cantidadRecibida}* ${item.modelo} (${item.color})\n`;
                });

                if (result.restablecidos.length > 0) {
                    msg += `\n🟢 *STOCK RESTABLECIDO (Fuera de peligro):*\n`;
                    result.restablecidos.forEach(r => {
                        msg += `• *${r.modelo} (${r.color})*: ${r.stockAnterior} ➔ *${r.stockNuevo} un.* (Mín: ${r.minimo})\n`;
                    });
                }

                await this.whatsappService.sendMessage(msg);
            } catch (wppErr) {
                console.warn('⚠️ No se pudo enviar notificación de WhatsApp al recibir pedido:', wppErr);
            }

            return result;

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

