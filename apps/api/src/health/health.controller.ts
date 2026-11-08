import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { S3Service } from '../infrastructure/aws/s3/s3.service.js';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`;

    try {
      await this.s3Service.checkBucket('investigationImages');
    } catch {
      throw new ServiceUnavailableException('Object storage is unreachable');
    }

    return {
      status: 'ok',
      service: 'tracelens-api',
      database: 'connected',
      storage: 'connected',
    };
  }
}
