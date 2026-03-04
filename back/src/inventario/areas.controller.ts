import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('areas')
export class AreasController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    findAll() {
        return this.prisma.areas.findMany();
    }
}
