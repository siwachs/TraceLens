import { Module } from '@nestjs/common';

import { InvestigationController } from './investigation.controller.js';

import { InvestigationService } from './investigation.service.js';

@Module({
  controllers: [InvestigationController],
  providers: [InvestigationService],
})
export class InvestigationModule {}
