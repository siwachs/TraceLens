import { Injectable, NotFoundException } from '@nestjs/common';

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

    const storageKey = `investigations/${investigationId}/assets/${assetId}/derived/thumbnail.jpg`;

    const existing = await this.prisma.researchAssetArtifact.findUnique({
      where: {
        researchAssetId_type: { researchAssetId: assetId, type: 'THUMBNAIL' },
      },
      select: { id: true },
    });
    await this.s3Service.put(
      'investigationImages',
      storageKey,
      thumbnailBuffer,
      'image/jpeg',
    );

    try {
      return await this.prisma.researchAssetArtifact.upsert({
        where: {
          researchAssetId_type: {
            researchAssetId: assetId,
            type: 'THUMBNAIL',
          },
        },
        create: {
          researchAssetId: assetId,
          type: 'THUMBNAIL',
          storageKey,
          contentType: 'image/jpeg',
          sizeBytes: BigInt(thumbnailBuffer.length),
        },
        update: {
          storageKey,
          contentType: 'image/jpeg',
          sizeBytes: BigInt(thumbnailBuffer.length),
        },
      });
    } catch (error) {
      if (!existing) {
        try {
          await this.s3Service.delete('investigationImages', storageKey);
        } catch {
          // Preserve the original persistence error.
        }
      }

      throw error;
    }
  }

  async deleteAllForAsset(assetId: string) {
    const artifacts = await this.prisma.researchAssetArtifact.findMany({
      where: { researchAssetId: assetId },
      select: { id: true, storageKey: true },
    });

    for (const artifact of artifacts) {
      await this.s3Service.delete('investigationImages', artifact.storageKey);

      await this.prisma.researchAssetArtifact.delete({
        where: { id: artifact.id },
      });
    }
  }

  async findForAsset(investigationId: string, assetId: string) {
    const asset = await this.prisma.researchAsset.findFirst({
      where: { id: assetId, investigationId },
      select: {
        artifacts: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!asset) {
      throw new NotFoundException('Research asset not found');
    }

    return asset.artifacts.map((artifact) => ({
      id: artifact.id,
      type: artifact.type,
      contentType: artifact.contentType,
      sizeBytes: artifact.sizeBytes.toString(),
      createdAt: artifact.createdAt,
    }));
  }

  async getContent(
    investigationId: string,
    assetId: string,
    artifactId: string,
  ) {
    const artifact = await this.prisma.researchAssetArtifact.findFirst({
      where: {
        id: artifactId,
        researchAssetId: assetId,
        researchAsset: { investigationId },
      },
    });

    if (!artifact) {
      throw new NotFoundException('Artifact not found');
    }

    const object = await this.s3Service.get(
      'investigationImages',
      artifact.storageKey,
    );

    return { artifact, object };
  }
}
