import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('stats')
    async getStats() {
        const [stockCritico, ordenesActivas, movimientos, cartuchos] = await Promise.all([
            // 1. Insumos con stock crítico
            this.prisma.cartuchos.count({
                where: {
                    stock_unidades: {
                        lte: this.prisma.cartuchos.fields.stock_minimo_unidades
                    }
                }
            }),

            // 2. Órdenes de servicio activas
            this.prisma.ordenes_servicio.count({
                where: {
                    estado: {
                        notIn: ['Entregado', 'Sin Solucion (Baja)']
                    }
                }
            }),

            // 3. Movimientos de entrega para Top Insumos y Consumo por Área
            this.prisma.movimientos_tinta.findMany({
                where: {
                    OR: [
                        { tipo_movimiento: 'ENTREGA_A__REA' },
                        { tipo_movimiento: 'ENTREGA A ÁREA' }
                    ]
                },
                include: {
                    cartuchos: true,
                    impresoras: {
                        include: {
                            areas: true
                        }
                    }
                }
            }),

            // 4. Todos los cartuchos para KPIs generales
            this.prisma.cartuchos.findMany()
        ]);

        // Procesar Top Insumos
        const insumoMap = new Map();
        movimientos.forEach(mov => {
            const key = mov.cartuchos?.modelo || 'Desconocido';
            insumoMap.set(key, (insumoMap.get(key) || 0) + mov.cantidad);
        });

        const topInsumos = Array.from(insumoMap.entries())
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // Procesar Consumo por Área
        const areaMap = new Map();
        movimientos.forEach(mov => {
            const key = mov.impresoras?.areas?.area || 'Sin Área';
            areaMap.set(key, (areaMap.get(key) || 0) + mov.cantidad);
        });

        const consumoPorArea = Array.from(areaMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        // Procesar Estados de Órdenes
        const ordenesStatus = await this.prisma.ordenes_servicio.groupBy({
            by: ['estado'],
            _count: {
                id: true
            }
        });

        const orderStats = ordenesStatus.map(s => ({
            name: s.estado,
            value: s._count.id
        }));

        return {
            kpis: {
                stockCritico,
                ordenesActivas,
                totalInsumos: cartuchos.length,
                consumoMensual: movimientos.filter(m => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return m.fecha >= monthAgo;
                }).length
            },
            topInsumos,
            consumoPorArea,
            orderStats
        };
    }
}
