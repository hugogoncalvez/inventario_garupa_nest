import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('tipos')
export class TiposController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.tipos.findMany();
    }
}

@Controller('estado')
export class EstadoController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.estados.findMany();
    }
}
