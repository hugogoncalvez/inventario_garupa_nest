import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('ordenes')
export class OrdenesController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async findAll() {
        return this.prisma.ordendeservicios.findMany({
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
        try {
            const { id_equipo, problema_reportado, tecnico_asignado, trabajo_realizado, estado, repuestos } = data;

            if (!id_equipo) {
                throw new HttpException('El ID del equipo es requerido', HttpStatus.BAD_REQUEST);
            }
            if (!problema_reportado) {
                throw new HttpException('El problema reportado es requerido', HttpStatus.BAD_REQUEST);
            }

            return await this.prisma.$transaction(async (tx) => {
                const orden = await tx.ordendeservicios.create({
                    data: {
                        id_equipo: String(id_equipo),
                        problema_reportado: problema_reportado || null,
                        tecnico_asignado: tecnico_asignado || null,
                        trabajo_realizado: trabajo_realizado || null,
                        estado: estado || 'Recibido',
                        fecha_recepcion: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });

                if (repuestos && Array.isArray(repuestos) && repuestos.length > 0) {
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
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error('Error al crear orden:', error);
            throw new HttpException(
                error.message || 'Error al crear la orden de servicio',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        try {
            const { problema_reportado, tecnico_asignado, trabajo_realizado, estado, fecha_entrega, repuestos } = data;

            const ordenId = Number(id);
            if (!Number.isInteger(ordenId)) {
                throw new HttpException('ID de orden inválido', HttpStatus.BAD_REQUEST);
            }

            // Normalizar strings: '' -> null para columnas nullable, recortar espacios
            const norm = (v: any) => (typeof v === 'string' ? (v.trim() === '' ? null : v) : (v ?? null));

            let fechaEntregaParsed: Date | null = null;
            if (fecha_entrega) {
                const d = new Date(fecha_entrega);
                if (isNaN(d.getTime())) {
                    throw new HttpException('fecha_entrega inválida', HttpStatus.BAD_REQUEST);
                }
                fechaEntregaParsed = d;
            }

            // Validar repuestos nuevos antes de la transacción para dar 400 claro
            const repuestosValidados: { id: number; cantidad: number }[] = [];
            if (repuestos !== undefined && repuestos !== null) {
                if (!Array.isArray(repuestos)) {
                    throw new HttpException('repuestos debe ser un arreglo', HttpStatus.BAD_REQUEST);
                }
                for (const r of repuestos) {
                    const repuestoId = Number(r?.id);
                    const cantidad = Number(r?.cantidad ?? 1);
                    if (!Number.isInteger(repuestoId)) {
                        throw new HttpException('Cada repuesto debe tener un id válido', HttpStatus.BAD_REQUEST);
                    }
                    if (!Number.isInteger(cantidad) || cantidad <= 0) {
                        throw new HttpException('La cantidad de cada repuesto debe ser un entero mayor a 0', HttpStatus.BAD_REQUEST);
                    }
                    repuestosValidados.push({ id: repuestoId, cantidad });
                }
            }

            return await this.prisma.$transaction(async (tx) => {
                // 1. Actualizar la orden
                const orden = await tx.ordendeservicios.update({
                    where: { id: ordenId },
                    data: {
                        problema_reportado: norm(problema_reportado),
                        tecnico_asignado: norm(tecnico_asignado),
                        trabajo_realizado: norm(trabajo_realizado),
                        estado: norm(estado),
                        fecha_entrega: fechaEntregaParsed,
                        updatedAt: new Date(),
                    },
                });

                // 2. Gestionar repuestos nuevos (si se envían)
                for (const r of repuestosValidados) {
                    await tx.ordenes_repuestos.create({
                        data: {
                            orden_id: ordenId,
                            repuesto_id: r.id,
                            cantidad: r.cantidad,
                            fecha: new Date()
                        }
                    });

                    await tx.repuestos.update({
                        where: { id: r.id },
                        data: {
                            stock_actual: {
                                decrement: r.cantidad
                            }
                        }
                    });
                }

                return orden;
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            console.error(`Error al actualizar orden ${id}:`, error);
            // Prisma: registro no encontrado
            if (error?.code === 'P2025') {
                throw new HttpException('Orden no encontrada', HttpStatus.NOT_FOUND);
            }
            // Prisma: FK fallida (repuesto inexistente) u otro constraint
            if (error?.code === 'P2003') {
                throw new HttpException(
                    'No se pudo agregar un repuesto: el repuesto no existe o la referencia es inválida',
                    HttpStatus.BAD_REQUEST,
                );
            }
            throw new HttpException(
                error?.message || 'Error al actualizar la orden de servicio',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prisma.ordendeservicios.delete({
            where: { id: Number(id) },
        });
    }
}
