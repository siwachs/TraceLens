import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class InvestigationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.investigation.create({
      data: { name },
    });
  }

  async findAll() {
    return this.prisma.investigation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
