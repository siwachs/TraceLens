import { Module } from '@nestjs/common';
import { S3Module } from '../infrastructure/aws/s3/s3.module.js';

import { HealthController } from './health.controller.js';

@Module({
  controllers: [HealthController],
  imports: [S3Module],
})
export class HealthModule {}
