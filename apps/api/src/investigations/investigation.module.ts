import { Module } from '@nestjs/common';
import { S3Module } from '../infrastructure/aws/s3/s3.module.js';

import { InvestigationController } from './investigation.controller.js';

import { InvestigationService } from './investigation.service.js';
import { AssetProcessingService } from './asset-processing.service.js';
import { ImageMetadataService } from './image-metadata.service.js';
import { ExifService } from './exif.service.js';

@Module({
  controllers: [InvestigationController],
  providers: [
    InvestigationService,
    AssetProcessingService,
    ImageMetadataService,
    ExifService,
  ],
  imports: [S3Module],
})
export class InvestigationModule {}
