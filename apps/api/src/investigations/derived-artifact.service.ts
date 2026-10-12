import { Injectable } from '@nestjs/common';

import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service.js';
import { S3Service } from '../infrastructure/aws/s3/s3.service.js';

@Injectable()
export class DerivedArtifactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createThumbnail(
    investigationId: string,
    assetId: string,
    imageBuffer: Buffer,
  ) {
    const thumbnailBuffer = await sharp(imageBuffer)
      .rotate()
      .resize({
        width: 320,
        height: 320,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const storageKey = `investigations/${investigationId}/assets/${assetId}/derived/thumbnail.jpg'`;

    await this.s3Service.put(
      'investigationImages',
      storageKey,
      thumbnailBuffer,
      'image/jpeg',
    );

    try {
      return await this.prisma.researchAssetArtifact.create({
        data: {
          researchAssetId: assetId,
          type: 'THUMBNAIL',
          storageKey,
          contentType: 'image/jpeg',
          sizeBytes: BigInt(thumbnailBuffer.length),
        },
      });
    } catch (error) {
      try {
        await this.s3Service.delete('investigationImages', storageKey);
      } catch {
        // Preserve the original persistence error.
      }

      throw error;
    }
  }
}
