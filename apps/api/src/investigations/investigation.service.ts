import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';

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

  async uploadAsset(investigationId: string, file: Express.Multer.File) {
    const investigation = await this.prisma.investigation.findUnique({
      where: { id: investigationId },
    });

    if (!investigation) {
      throw new NotFoundException('Investigation not found');
    }

    const assetId = randomUUID();
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    const storageKey = `investigations/${investigationId}/assets/${assetId}`;

    const asset = await this.prisma.researchAsset.create({
      data: {
        id: assetId,
        investigationId,
        originalFilename: file.originalname,
        contentType: file.mimetype,
        sizeBytes: BigInt(file.size),
        storageKey,
        sha256,
        status: 'UPLOADING',
      },
    });

    try {
      await this.s3Service.put(
        'investigationImages',
        storageKey,
        file.buffer,
        file.mimetype,
      );

      return await this.prisma.researchAsset.update({
        where: { id: asset.id },
        data: {
          storageKey,
          status: 'READY',
        },
      });
    } catch (error) {
      await this.prisma.researchAsset.update({
        where: { id: asset.id },
        data: {
          storageKey,
          status: 'FAILED',
        },
      });

      throw error;
    }
  }
}
