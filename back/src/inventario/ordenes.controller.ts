import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('ordenes')
export class OrdenesController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async findAll() {
        return this.prisma.ordendeservicios.findMany({ // Corregido segun schema.prisma (linea 130)
            orderBy: {
                id: 'desc'
            }
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.prisma.ordendeservicios.findUnique({
            where: { id: Number(id) },
            include: {
                repuestos_usados: {
                    include: {
                        repuesto: true
                    }
                }
            }
        });
    }

    @Post()
    async create(@Body() data: any) {
        const { id_equipo, problema_reportado, tecnico_asignado, trabajo_realizado, estado, repuestos } = data;
        
        return this.prisma.$transaction(async (tx) => {
            // 1. Crear la orden
            const orden = await tx.ordendeservicios.create({
                data: {
                    id_equipo: String(id_equipo),
                    problema_reportado,
                    tecnico_asignado,
                    trabajo_realizado,
                    estado,
                    fecha_recepcion: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            // 2. Si hay repuestos, registrarlos y descontar stock
            if (repuestos && Array.isArray(repuestos)) {
                for (const r of repuestos) {
                    await tx.ordenes_repuestos.create({
                        data: {
                            orden_id: orden.id,
                            repuesto_id: r.id,
                            cantidad: r.cantidad || 1,
                            fecha: new Date()
                        }
                    });

                    await tx.repuestos.update({
                        where: { id: r.id },
                        data: {
                            stock_actual: {
                                decrement: r.cantidad || 1
                            }
                        }
                    });
                }
            }

            return orden;
        });
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        const { problema_reportado, tecnico_asignado, trabajo_realizado, estado, fecha_entrega, repuestos } = data;
        
        return this.prisma.$transaction(async (tx) => {
            // 1. Actualizar la orden
            const orden = await tx.ordendeservicios.update({
                where: { id: Number(id) },
                data: {
                    problema_reportado,
                    tecnico_asignado,
                    trabajo_realizado,
                    estado,
                    fecha_entrega: fecha_entrega ? new Date(fecha_entrega) : null,
                    updatedAt: new Date(),
                },
            });

            // 2. Gestionar repuestos nuevos (si se envían)
            // Nota: Por simplicidad, aquí solo agregamos nuevos repuestos. 
            // Si el repuesto ya existía en la orden, se podría mejorar la lógica para evitar duplicados.
            if (repuestos && Array.isArray(repuestos)) {
                for (const r of repuestos) {
                    // Solo procesar si es un repuesto nuevo (no estaba ya en la orden)
                    // Esto se puede refinar según la UI, pero por ahora permitimos añadir más.
                    await tx.ordenes_repuestos.create({
                        data: {
                            orden_id: Number(id),
                            repuesto_id: r.id,
                            cantidad: r.cantidad || 1,
                            fecha: new Date()
                        }
                    });

                    await tx.repuestos.update({
                        where: { id: r.id },
                        data: {
                            stock_actual: {
                                decrement: r.cantidad || 1
                            }
                        }
                    });
                }
            }

            return orden;
        });
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prisma.ordendeservicios.delete({
            where: { id: Number(id) },
        });
    }
}
