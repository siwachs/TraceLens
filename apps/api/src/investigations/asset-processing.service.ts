import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3Service } from '../infrastructure/aws/s3/s3.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ImageMetadataService } from './image-metadata.service.js';
import { ExifService } from './exif.service.js';
import { PerceptualHashService } from './perceptual-hash.service.js';
import { DerivedArtifactService } from './derived-artifact.service.js';

import type { Readable } from 'node:stream';
import type { AssetsConfig } from './assets.config.js';

@Injectable()
export class AssetProcessingService {
  private assetsConfig: AssetsConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly imageMetadataService: ImageMetadataService,
    private readonly exifService: ExifService,
    private readonly perceptualHashService: PerceptualHashService,
    private readonly derivedArtifactService: DerivedArtifactService,
    private readonly configService: ConfigService,
  ) {
    this.assetsConfig = this.configService.getOrThrow<AssetsConfig>('assets');
  }

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

    const staleBefore = new Date(
      Date.now() - this.assetsConfig.processingStaleAfterMS,
    );

    try {
      const claim = await this.prisma.researchAsset.updateMany({
        where: {
          id: asset.id,
          OR: [
            { status: { in: ['READY', 'FAILED'] } },
            { status: 'PROCESSING', updatedAt: { lt: staleBefore } },
          ],
        },
        data: {
          status: 'PROCESSING',
        },
      });
      if (claim.count === 0) {
        throw new ConflictException(
          'Asset must be READY or FAILED to be processed, and not already in progress',
        );
      }

      const object = await this.s3Service.get(
        'investigationImages',
        asset.storageKey,
      );

      if (!object.Body) {
        throw new Error('S3 object has no body');
      }

      const imageBuffer = await this.streamToBuffer(object.Body as Readable);

      const metadata = await this.imageMetadataService.extract(imageBuffer);
      const exif = await this.exifService.extract(imageBuffer);
      const perceptualHash =
        await this.perceptualHashService.calculate(imageBuffer);
      const thumbnail = await this.derivedArtifactService.createThumbnail(
        investigationId,
        assetId,
        imageBuffer,
      );

      await this.prisma.researchAsset.update({
        where: {
          id: asset.id,
        },
        data: {
          status: 'PROCESSED',
          analysis: {
            metadata,
            exif,
            perceptualHash,
          },
        },
      });

      return {
        assetId: asset.id,
        status: 'PROCESSED',
        sizeBytes: imageBuffer.length,
        artifacts: [
          {
            type: thumbnail.type,
            storageKey: thumbnail.storageKey,
            contentType: thumbnail.contentType,
            sizeBytes: Number(thumbnail.sizeBytes),
          },
        ],
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
