import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async login(usuario: string, password: string) {
        const user = await this.prisma.usuarios.findUnique({
            where: {
                usuario,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no existe');
        }

        // ⚠️ Por ahora comparación directa
        if (user.password !== password) {
            throw new UnauthorizedException('Password incorrecto');
        }

        // Nunca devolver password
        const { password: _, ...result } = user;

        return result;
    }
}

