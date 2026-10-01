import { Injectable, NotFoundException } from '@nestjs/common';

import { S3Service } from '../infrastructure/aws/s3/s3.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type { Readable } from 'node:stream';

@Injectable()
export class AssetProcessingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async process(investigationId: string, assetId: string) {
    const asset = await this.prisma.researchAsset.findFirst({
      where: {
        id: assetId,
        investigationId,
      },
    });

    if (!asset) {
      throw new NotFoundException('Research asset not found');
    }

    if (asset.status !== 'READY') {
      throw new Error(`Asset cannot be processed from status ${asset.status}`);
    }

    await this.prisma.researchAsset.update({
      where: {
        id: asset.id,
      },
      data: {
        status: 'PROCESSING',
      },
    });

    try {
      const object = await this.s3Service.get(
        'investigationImages',
        asset.storageKey,
      );

      if (!object.Body) {
        throw new Error('S3 object has no body');
      }

      const imageBuffer = await this.streamToBuffer(object.Body as Readable);

      // Image analysis will be added here.
      // EXIF, perceptual hash, dimensions, etc.

      await this.prisma.researchAsset.update({
        where: {
          id: asset.id,
        },
        data: {
          status: 'PROCESSED',
        },
      });

      return {
        assetId: asset.id,
        status: 'PROCESSED',
        sizeBytes: imageBuffer.length,
      };
    } catch (error) {
      await this.prisma.researchAsset.update({
        where: {
          id: asset.id,
        },
        data: {
          status: 'FAILED',
        },
      });

      throw error;
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }
}
