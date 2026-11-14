import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';
import { S3Service } from '../infrastructure/aws/s3/s3.service.js';
import { DerivedArtifactService } from './derived-artifact.service.js';
import sharp, { type Metadata } from 'sharp';

import { AssetsConfig } from './assets.config.js';

@Injectable()
export class InvestigationService {
  private assetsConfig: AssetsConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly derivedArtifactService: DerivedArtifactService,
    private readonly configService: ConfigService,
  ) {
    this.assetsConfig = configService.getOrThrow<AssetsConfig>('assets');
  }

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
    await this.validateImage(file);

    const assetId = randomUUID();
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    const storageKey = `investigations/${investigationId}/assets/${assetId}`;

    const input = await this.prisma.input
      .create({
        data: {
          investigationId,
          type: 'IMAGE',
          value: file.originalname,
          normalizedValue: sha256,
          researchAsset: {
            create: {
              id: assetId,
              originalFilename: file.originalname,
              contentType: file.mimetype,
              sizeBytes: BigInt(file.size),
              storageKey,
              sha256,
              status: 'UPLOADING',
            },
          },
        },
      })
      .catch((error: unknown) => {
        if ((error as { code?: string } | null)?.code === 'P2002') {
          throw new ConflictException(
            'This image is already in the investigation',
          );
        }

        throw error;
      });

    try {
      await this.s3Service.put(
        'investigationImages',
        storageKey,
        file.buffer,
        file.mimetype,
      );

      return await this.prisma.researchAsset.update({
        where: { id: assetId },
        data: {
          storageKey,
          status: 'READY',
        },
      });
    } catch (error) {
      await this.rollbackUpload(storageKey, input.id);

      throw error;
    }
  }

  private async validateImage(file: Express.Multer.File): Promise<void> {
    let metadata: Metadata;

    try {
      metadata = await sharp(file.buffer).metadata();
    } catch {
      throw new BadRequestException('File is not a valid image');
    }

    const { investigationImage } = this.assetsConfig;
    const isAllowed = investigationImage.allowedFormats.includes(
      metadata.format ?? '',
    );
    if (!isAllowed) {
      throw new BadRequestException(
        `Unsupported image format. Allowed: ${investigationImage.allowedFormats.join(', ')}`,
      );
    }

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width * metadata.height > investigationImage.maxPixels
    ) {
      throw new BadRequestException('Image dimensions are not acceptable');
    }
  }

  private async rollbackUpload(storageKey: string, inputId: string) {
    try {
      await this.s3Service.delete('investigationImages', storageKey);
    } catch {
      // Best effort: the object may not exist if the upload itself failed.
    }

    try {
      await this.prisma.input.delete({ where: { id: inputId } });
    } catch {
      // Preserve the original upload error.
    }
  }

  private async findAsset(investigationId: string, assetId: string) {
    const asset = await this.prisma.researchAsset.findFirst({
      where: {
        id: assetId,
        input: { investigationId },
      },
    });

    if (!asset) {
      throw new NotFoundException('Research asset not found');
    }

    return asset;
  }

  async getAsset(investigationId: string, assetId: string) {
    const asset = await this.findAsset(investigationId, assetId);

    const object = await this.s3Service.get(
      'investigationImages',
      asset.storageKey,
    );

    return {
      asset,
      object,
    };
  }

  async getAssetAnalysis(investigationId: string, assetId: string) {
    const asset = await this.findAsset(investigationId, assetId);

    return {
      assetId: asset.id,
      status: asset.status,
      sha256: asset.sha256,
      analysis: asset.analysis,
      failureReason: asset.failureReason,
    };
  }

  async deleteAsset(investigationId: string, assetId: string) {
    const asset = await this.findAsset(investigationId, assetId);

    await this.derivedArtifactService.deleteAllForAsset(asset.id);
    await this.s3Service.delete('investigationImages', asset.storageKey);

    await this.prisma.input.delete({
      where: {
        id: asset.inputId,
      },
    });
  }

  async deleteInvestigation(investigationId: string) {
    const investigation = await this.prisma.investigation.findUnique({
      where: { id: investigationId },
      select: { id: true },
    });

    if (!investigation) {
      throw new NotFoundException('Investigation not found');
    }

    const assets = await this.prisma.researchAsset.findMany({
      where: { input: { investigationId } },
      select: { id: true },
    });

    for (const asset of assets) {
      await this.deleteAsset(investigationId, asset.id);
    }

    await this.prisma.investigation.delete({
      where: { id: investigationId },
    });
  }

  async findAssets(investigationId: string) {
    const investigation = await this.prisma.investigation.findUnique({
      where: {
        id: investigationId,
      },
      select: {
        id: true,
      },
    });

    if (!investigation) {
      throw new NotFoundException('Investigation not found');
    }

    const assets = await this.prisma.researchAsset.findMany({
      where: {
        input: { investigationId },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return assets.map((asset) => ({
      id: asset.id,
      investigationId,
      originalFilename: asset.originalFilename,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes.toString(),
      storageKey: asset.storageKey,
      status: asset.status,
      sha256: asset.sha256,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    }));
  }
}
