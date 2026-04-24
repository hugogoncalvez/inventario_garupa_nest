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
        const { items_recibidos, usuario_id } = body; // items_recibidos: [{ item_id, cantidad }]

        return this.prisma.$transaction(async (tx) => {
            for (const rec of items_recibidos) {
                // 1. Actualizar el ítem del pedido
                const itemPedido = await tx.pedidos_items.update({
                    where: { id: Number(rec.item_id) },
                    data: {
                        cantidad_recibida: { increment: Number(rec.cantidad) },
                    },
                });

                // 2. Registrar el movimiento de COMPRA real si se recibió algo
                if (Number(rec.cantidad) > 0) {
                    await tx.movimientos_tinta.create({
                        data: {
                            cartucho_id: itemPedido.cartucho_id,
                            cantidad: Number(rec.cantidad),
                            usuario_id: Number(usuario_id),
                            tipo_movimiento: movimientos_tinta_tipo_movimiento.COMPRA,
                            fecha: new Date(),
                        }
                    });

                    // 3. Incrementar el stock del cartucho
                    await tx.cartuchos.update({
                        where: { id: itemPedido.cartucho_id },
                        data: {
                            stock_unidades: { increment: Number(rec.cantidad) },
                            updatedAt: new Date(),
                        }
                    });
                }
            }

            // 4. Verificar si el pedido está completo para cambiar el estado
            const allItems = await tx.pedidos_items.findMany({
                where: { pedido_id: Number(id) }
            });

            const isComplete = allItems.every(i => i.cantidad_recibida >= i.cantidad_pedida);
            const isPartial = allItems.some(i => i.cantidad_recibida > 0);

            let nuevoEstado: pedidos_estado = 'PENDIENTE';
            if (isComplete) nuevoEstado = 'RECIBIDO';
            else if (isPartial) nuevoEstado = 'PARCIAL';

            return tx.pedidos.update({
                where: { id: Number(id) },
                data: { estado: nuevoEstado }
            });
        });
    }

    @Put(':id/cancelar')
    async cancelarPedido(@Param('id') id: string) {
        return this.prisma.pedidos.update({
            where: { id: Number(id) },
            data: { estado: 'CANCELADO' }
        });
    }
}
