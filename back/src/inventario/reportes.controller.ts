import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { movimientos_tinta_tipo_movimiento } from '@prisma/client';

@Controller('reportes')
export class ReportesController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('compras')
    async getCompras(@Query('desde') desde: string, @Query('hasta') hasta: string) {
        const movimientos = await this.prisma.movimientos_tinta.findMany({
            where: {
                tipo_movimiento: 'COMPRA',
                fecha: {
                    gte: new Date(desde),
                    lte: new Date(hasta),
                },
            },
            include: {
                cartuchos: true,
                usuarios: true
            }
        });

        const comprasMapeadas = movimientos.map(mov => ({
            fecha: mov.fecha,
            producto: mov.cartuchos?.modelo || 'Desconocido',
            tipo: mov.cartuchos?.tipo || '',
            cantidad: mov.cantidad,
            unidad: 'Unidades',
            usuario: `${mov.usuarios?.nombre || ''} ${mov.usuarios?.apellido || ''}`.trim() || mov.usuarios?.usuario || 'Sistema'
        }));

        // Podríamos incluir compras de insumos a granel aquí también si fuera necesario
        return comprasMapeadas;
    }

    @Get('recargas')
    async getRecargas() {
        return this.prisma.movimientos_insumo_granel.findMany({
            include: {
                insumos_granel: true,
                usuarios: true,
                impresoras: true
            }
        });
    }

    @Get('consumo-por-area')
    async getConsumoPorArea(@Query('desde') desde: string, @Query('hasta') hasta: string) {
        try {
            const movimientos: any[] = await this.prisma.movimientos_tinta.findMany({
                where: {
                    fecha: {
                        gte: new Date(desde),
                        lte: new Date(hasta),
                    },
                },
                include: {
                    impresoras: {
                        include: {
                            areas: true,
                        },
                    },
                    cartuchos: true,
                    usuarios: true,
                },
            });

            // Filtramos en JS para mayor seguridad con los Enums mapeados
            const entregas = movimientos.filter(mov =>
                mov.tipo_movimiento === 'ENTREGA_A__REA' ||
                mov.tipo_movimiento === 'ENTREGA A ÁREA'
            );

            return entregas.map(mov => ({
                id: mov.id,
                'impresora.area.area': mov.impresoras?.areas?.area || 'Sin Área',
                'impresora.area.id': mov.impresoras?.areas?.id || '',
                'cartucho.modelo': mov.cartuchos?.modelo || 'Desconocido',
                'cartucho.color': mov.cartuchos?.color || '',
                'cartucho.tipo': mov.cartuchos?.tipo || '',
                'cartucho.id': mov.cartucho_id,
                'impresora.id': mov.impresora_id,
                'impresora.modelo': mov.impresoras?.modelo || '',
                'impresora.marca': mov.impresoras?.marca || '',
                'usuario.id': mov.usuario_id,
                'usuario.nombre': mov.usuarios?.nombre || '',
                'usuario.apellido': mov.usuarios?.apellido || '',
                'usuario.usuario': mov.usuarios?.usuario || '',
                cantidad: mov.cantidad,
                fecha: mov.fecha,
            }));
        } catch (error) {
            console.error('Error en getConsumoPorArea:', error);
            throw error;
        }
    }

    @Get('recargas-granel')
    async getRecargasGranel(@Query('desde') desde: string, @Query('hasta') hasta: string) {
        const movimientos: any[] = await this.prisma.movimientos_insumo_granel.findMany({
            where: {
                fecha: {
                    gte: new Date(desde),
                    lte: new Date(hasta),
                },
                OR: [
                    { tipo_movimiento: 'RECARGA' },
                    { tipo_movimiento: 'RECARGA DE CARTUCHO' },
                    { tipo_movimiento: 'RECARGA_DE_CARTUCHO' }
                ]
            },
            include: {
                impresoras: {
                    include: {
                        areas: true,
                    },
                },
                cartuchos: true,
                insumos_granel: true,
                usuarios: true,
            },
        });

        return movimientos.map((mov: any) => ({
            'impresora.area.area': mov.impresoras?.areas?.area || 'Sin Área',
            'insumo_granel.unidad_medida': mov.insumos_granel?.unidad_medida || '',
            'impresora.modelo': mov.impresoras?.modelo || 'N/A',
            'impresora.marca': mov.impresoras?.marca || '',
            'unidad_cartucho.modelo': mov.cartuchos?.modelo || 'N/A',
            'unidad_cartucho.color': mov.cartuchos?.color || '',
            'insumo_granel.nombre': mov.insumos_granel?.nombre || 'Desconocido',
            'usuario.nombre': mov.usuarios?.nombre || '',
            'usuario.apellido': mov.usuarios?.apellido || '',
            total_cartuchos_recargados: mov.cantidad_cartuchos_recargados || 0,
            total_insumo_consumido: mov.cantidad_usada || 0,
            fecha: mov.fecha,
        }));
    }
}
