/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (userExists) throw new BadRequestException('Email já está em uso.');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        vbucks: 10000, // bônus de boas-vindas
      },
    });

    return this.generateTokenWithUser(user);
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) throw new UnauthorizedException('Credenciais inválidas.');

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid)
      throw new UnauthorizedException('Credenciais inválidas.');

    return this.generateTokenWithUser(user);
  }

  private generateTokenWithUser(user: any) {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwt.sign(payload);

    // Remover password antes de retornar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword
    };
  }
}
