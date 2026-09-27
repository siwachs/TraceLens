import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { S3Service } from '../infrastructure/aws/s3/s3.service.js';

@Injectable()
export class InvestigationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

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
