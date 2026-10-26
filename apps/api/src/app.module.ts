import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';
import { InvestigationModule } from './investigations/investigation.module.js';

import awsConfig from './infrastructure/aws/aws.config.js';
import assetsConfig from './investigations/assets.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [awsConfig, assetsConfig] }),
    PrismaModule,
    HealthModule,
    InvestigationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
