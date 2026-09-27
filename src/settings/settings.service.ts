import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompany() {
    const rows = await this.prisma.companySetting.findMany({
      orderBy: { key: 'asc' },
    });
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }
}
