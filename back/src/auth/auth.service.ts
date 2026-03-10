// import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async login(usuario: string, password: string) {
        try {
            console.log(`🔐 Intentando login para usuario: ${usuario}`);

            const user = await this.prisma.usuarios.findUnique({
                where: { usuario },
                select: {
                    id: true,
                    usuario: true,
                    nombre: true,
                    apellido: true,
                    password: true,
                },
            });

            if (!user) {
                console.log(`❌ Usuario no encontrado: ${usuario}`);
                throw new UnauthorizedException('Usuario no existe');
            }

            if (user.password !== password) {
                console.log(`❌ Password incorrecto para: ${usuario}`);
                throw new UnauthorizedException('Password incorrecto');
            }

            const { password: _, ...result } = user;

            console.log(`✅ Login exitoso para: ${usuario}`);

            return result;
        } catch (error) {
            console.error('🚨 ERROR EN LOGIN:', error);
            throw error;
        }
    }
}