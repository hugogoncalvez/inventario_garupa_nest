import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 👈 MUY IMPORTANTE
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
