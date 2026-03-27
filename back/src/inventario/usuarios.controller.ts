import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async findAll() {
        return this.prisma.usuarios.findMany({
            select: {
                id: true,
                nombre: true,
                apellido: true,
                usuario: true
            },
            orderBy: {
                nombre: 'asc'
            }
        });
    }
}
