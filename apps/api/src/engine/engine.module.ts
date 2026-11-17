import { Module } from '@nestjs/common';

import { PipelineRegistryService } from './serivces/index.js';

@Module({
  providers: [PipelineRegistryService],
  exports: [PipelineRegistryService],
})
export class EngineModule {}
