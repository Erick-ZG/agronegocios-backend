import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { toPublicUser } from './users.mapper';

const userInclude = {
  role: {
    include: {
      permissions: { include: { permission: true } },
    },
  },
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });
    return users.map(toPublicUser);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return toPublicUser(user);
  }

  async create(dto: CreateUserDto) {
    await this.ensureRole(dto.roleId);
    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        roleId: dto.roleId,
        isActive: dto.isActive ?? true,
      },
      include: userInclude,
    });
    return toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (dto.roleId) {
      await this.ensureRole(dto.roleId);
    }
    if (id === actorId && dto.isActive === false) {
      throw new BadRequestException('No puede desactivar su propio usuario');
    }

    let email = current.email;
    if (dto.email) {
      email = dto.email.toLowerCase().trim();
      const clash = await this.prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (clash) {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        email,
        roleId: dto.roleId,
        isActive: dto.isActive,
      },
      include: userInclude,
    });
    return toPublicUser(user);
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(dto.password, 10) },
    });
    return { ok: true };
  }

  async remove(id: string, actorId: string) {
    const current = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!current) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (id === actorId) {
      throw new BadRequestException('No puede eliminar su propio usuario');
    }
    if (current.role.slug === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: { role: { slug: 'ADMIN' } },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Debe quedar al menos un administrador del sistema');
      }
    }
    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureRole(roleId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
  }
}
