import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PartnerKind, PersonType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { QueryPartnersDto } from './dto/query-partners.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

const partnerInclude = { contacts: true } as const;

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPartnersDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.PartnerWhereInput = {};

    if (query.kind === PartnerKind.PROVEEDOR) {
      where.kind = { in: [PartnerKind.PROVEEDOR, PartnerKind.AMBOS] };
    } else if (query.kind === PartnerKind.CLIENTE) {
      where.kind = { in: [PartnerKind.CLIENTE, PartnerKind.AMBOS] };
    } else if (query.kind) {
      where.kind = query.kind;
    }

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { documentNumber: { contains: q, mode: 'insensitive' } },
        { businessName: { contains: q, mode: 'insensitive' } },
        { tradeName: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.partner.count({ where }),
      this.prisma.partner.findMany({
        where,
        include: partnerInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: partnerInclude,
    });
    if (!partner) {
      throw new NotFoundException('Tercero no encontrado');
    }
    return partner;
  }

  async create(dto: CreatePartnerDto) {
    await this.assertUniqueDocument(dto.documentNumber);
    return this.prisma.partner.create({
      data: this.toCreateData(dto),
      include: partnerInclude,
    });
  }

  async update(id: string, dto: UpdatePartnerDto) {
    const current = await this.prisma.partner.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Tercero no encontrado');
    }
    if (dto.documentNumber && dto.documentNumber !== current.documentNumber) {
      await this.assertUniqueDocument(dto.documentNumber, id);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.contacts) {
        await tx.partnerContact.deleteMany({ where: { partnerId: id } });
      }
      return tx.partner.update({
        where: { id },
        data: this.toUpdateData(dto),
        include: partnerInclude,
      });
    });
  }

  async remove(id: string) {
    const current = await this.prisma.partner.findUnique({
      where: { id },
      include: { _count: { select: { costEntries: true, tripsAsClient: true } } },
    });
    if (!current) {
      throw new NotFoundException('Tercero no encontrado');
    }
    if (current._count.costEntries > 0 || current._count.tripsAsClient > 0) {
      throw new ConflictException(
        'No se puede eliminar: el tercero está referenciado en costos o viajes',
      );
    }
    await this.prisma.partner.delete({ where: { id } });
    return { ok: true };
  }

  async setActive(id: string, isActive: boolean) {
    const current = await this.prisma.partner.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Tercero no encontrado');
    }
    return this.prisma.partner.update({
      where: { id },
      data: { isActive },
      include: partnerInclude,
    });
  }

  private async assertUniqueDocument(documentNumber: string, excludeId?: string) {
    const clash = await this.prisma.partner.findFirst({
      where: {
        documentNumber: documentNumber.trim(),
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (clash) {
      throw new ConflictException('Ya existe un tercero con ese documento');
    }
  }

  private contactCreates(dto: CreatePartnerDto | UpdatePartnerDto) {
    return dto.contacts?.map((contact) => ({
      name: contact.name.trim(),
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
    }));
  }

  private toCreateData(dto: CreatePartnerDto): Prisma.PartnerCreateInput {
    const contacts = this.contactCreates(dto);
    return {
      kind: dto.kind,
      personType: dto.personType,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber.trim(),
      businessName:
        dto.personType === PersonType.JURIDICA ? dto.businessName?.trim() : null,
      firstName: dto.personType === PersonType.NATURAL ? dto.firstName?.trim() : null,
      lastName: dto.personType === PersonType.NATURAL ? dto.lastName?.trim() : null,
      tradeName: dto.tradeName?.trim(),
      email: dto.email?.toLowerCase().trim(),
      phone: dto.phone?.trim(),
      department: dto.department?.trim(),
      province: dto.province?.trim(),
      district: dto.district?.trim(),
      address: dto.address?.trim(),
      notes: dto.notes?.trim(),
      isActive: dto.isActive ?? true,
      ...(contacts ? { contacts: { create: contacts } } : {}),
    };
  }

  private toUpdateData(dto: UpdatePartnerDto): Prisma.PartnerUpdateInput {
    const contacts = this.contactCreates(dto);
    return {
      kind: dto.kind,
      personType: dto.personType,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber?.trim(),
      businessName: dto.businessName?.trim(),
      firstName: dto.firstName?.trim(),
      lastName: dto.lastName?.trim(),
      tradeName: dto.tradeName?.trim(),
      email: dto.email?.toLowerCase().trim(),
      phone: dto.phone?.trim(),
      department: dto.department?.trim(),
      province: dto.province?.trim(),
      district: dto.district?.trim(),
      address: dto.address?.trim(),
      notes: dto.notes?.trim(),
      isActive: dto.isActive,
      ...(contacts ? { contacts: { create: contacts } } : {}),
    };
  }
}
