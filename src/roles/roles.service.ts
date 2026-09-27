import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRoleDto } from './dto/upsert-role.dto';

const roleInclude = {
  permissions: { include: { permission: true } },
  _count: { select: { users: true } },
} as const;

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      include: roleInclude,
      orderBy: { name: 'asc' },
    });
  }

  findPermissions() {
    return this.prisma.permission.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: roleInclude,
    });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    return role;
  }

  async create(dto: UpsertRoleDto) {
    await this.ensurePermissions(dto.permissionIds);
    const slug = await this.uniqueSlug(this.toSlug(dto.name));
    return this.prisma.role.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        permissions: {
          create: dto.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include: roleInclude,
    });
  }

  async update(id: string, dto: UpsertRoleDto) {
    const current = await this.findOne(id);
    await this.ensurePermissions(dto.permissionIds);

    const slug =
      current.slug === 'ADMIN'
        ? 'ADMIN'
        : await this.uniqueSlug(this.toSlug(dto.name), id);

    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      return tx.role.update({
        where: { id },
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim(),
          permissions: {
            create: dto.permissionIds.map((permissionId) => ({ permissionId })),
          },
        },
        include: roleInclude,
      });
    });
  }

  async remove(id: string) {
    const current = await this.findOne(id);
    if (current.slug === 'ADMIN') {
      throw new BadRequestException('No se puede eliminar el rol administrador del sistema');
    }
    if (current._count.users > 0) {
      throw new ConflictException('No se puede eliminar un rol con usuarios asignados');
    }
    await this.prisma.role.delete({ where: { id } });
    return { ok: true };
  }

  private async ensurePermissions(permissionIds: string[]) {
    const count = await this.prisma.permission.count({
      where: { id: { in: permissionIds } },
    });
    if (count !== permissionIds.length) {
      throw new BadRequestException('Hay permisos inválidos en la selección');
    }
  }

  private toSlug(name: string) {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || 'rol';
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let suffix = 2;
    while (
      await this.prisma.role.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    return slug;
  }
}
