import { Module } from '@nestjs/common';
import { S3Module } from '../infrastructure/aws/s3/s3.module.js';

import { InvestigationController } from './investigation.controller.js';

import { InvestigationService } from './investigation.service.js';

@Module({
  controllers: [InvestigationController],
  providers: [InvestigationService],
  imports: [S3Module],
})
export class InvestigationModule {}
